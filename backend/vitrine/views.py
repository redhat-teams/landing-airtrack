import hashlib
import json
import logging

from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import FileResponse, Http404, HttpResponse, HttpResponseRedirect, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from . import ai
from .emails import send_welcome
from .knowledge import PLANS
from .models import INTERESTS, AssistantLog, DownloadClick, Subscriber

logger = logging.getLogger(__name__)


# --- outils ---------------------------------------------------------------

def _client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    return forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR", "")


def _rate_limited(request, scope, limit, window_s):
    """Limite simple par IP (cache mémoire) : True si la limite est atteinte."""
    ip_hash = hashlib.sha256(_client_ip(request).encode()).hexdigest()[:16]
    key = f"rl:{scope}:{ip_hash}"
    count = cache.get(key, 0)
    if count >= limit:
        return True
    cache.set(key, count + 1, window_s)
    return False


def _json_body(request):
    try:
        return json.loads(request.body or b"{}")
    except (ValueError, UnicodeDecodeError):
        return None


def _error(code, message, status):
    return JsonResponse({"error": code, "message": message}, status=status)


def _apk_available():
    cfg = settings.AIRTRACK
    return bool(cfg["APK_URL"]) or cfg["APK_FILE"].exists()


# --- API ------------------------------------------------------------------

@require_GET
def health(request):
    return JsonResponse({"status": "ok", "ai": ai.ai_enabled()})


@require_GET
@ensure_csrf_cookie
def site_config(request):
    """Liens de téléchargement, plans et contact : modifiables dans les variables d'environnement, sans rebuild."""
    cfg = settings.AIRTRACK
    return JsonResponse(
        {
            "downloads": {
                "apk": "/download/apk/" if _apk_available() else None,
                "android": "/download/android/" if cfg["PLAY_STORE_URL"] else None,
                "ios": "/download/ios/" if cfg["APP_STORE_URL"] else None,
            },
            "plans": PLANS,
            "interests": [{"code": k, "label": v} for k, v in INTERESTS.items()],
            "contact": {"email": cfg["SUPPORT_EMAIL"], "whatsapp": cfg["SUPPORT_WHATSAPP"] or None},
            "ai_enabled": ai.ai_enabled(),
        }
    )


@require_POST
def assistant(request):
    data = _json_body(request)
    if not isinstance(data, dict) or not isinstance(data.get("messages"), list):
        return _error("invalid", "Envoyez une liste de messages.", 400)
    messages = []
    for item in data["messages"][-12:]:
        role = item.get("role") if isinstance(item, dict) else None
        content = str(item.get("content", "")).strip()[:1000] if isinstance(item, dict) else ""
        if role in {"user", "assistant"} and content:
            if messages and messages[-1]["role"] == role:
                messages[-1]["content"] += "\n" + content
            else:
                messages.append({"role": role, "content": content})
    while messages and messages[0]["role"] != "user":
        messages.pop(0)
    if not messages or messages[-1]["role"] != "user":
        return _error("invalid", "Écrivez votre question.", 400)
    if _rate_limited(request, "assistant", limit=30, window_s=600):
        return _error("rate_limited", "Vous avez posé beaucoup de questions. Réessayez dans quelques minutes.", 429)

    reply, source = ai.answer(messages)
    AssistantLog.objects.create(question=messages[-1]["content"], answer=reply, source=source)
    return JsonResponse({"reply": reply, "source": source})


@require_POST
def subscribe(request):
    data = _json_body(request)
    if not isinstance(data, dict):
        return _error("invalid", "Formulaire illisible, rechargez la page.", 400)
    if data.get("website"):  # champ piège invisible : un robot l'a rempli
        return JsonResponse({"ok": True, "message": "Inscription enregistrée."})

    email = str(data.get("email", "")).strip().lower()
    try:
        validate_email(email)
    except ValidationError:
        return _error("invalid_email", "Cette adresse e-mail n'est pas valide. Vérifiez-la, par exemple nom@exemple.ci.", 400)
    first_name = str(data.get("first_name", "")).strip()[:60]
    interests = [c for c in data.get("interests", []) if c in INTERESTS] if isinstance(data.get("interests"), list) else []

    if _rate_limited(request, "subscribe", limit=6, window_s=3600):
        return _error("rate_limited", "Trop d'inscriptions depuis votre connexion. Réessayez dans une heure.", 429)

    sub = Subscriber.objects.filter(email=email).first()
    if sub and sub.is_active:
        changed = False
        if interests and interests != sub.interests:
            sub.interests, changed = interests, True
        if first_name and first_name != sub.first_name:
            sub.first_name, changed = first_name, True
        if changed:
            sub.save(update_fields=["interests", "first_name"])
        return JsonResponse({"ok": True, "already": True, "message": "Vous êtes déjà inscrit : vos préférences sont à jour.", "welcome": sub.ai_welcome})

    welcome = ai.welcome_message(first_name, interests)
    if sub:  # réinscription après désinscription
        sub.first_name, sub.interests, sub.ai_welcome = first_name or sub.first_name, interests, welcome
        sub.is_active, sub.unsubscribed_at = True, None
        sub.save()
    else:
        sub = Subscriber.objects.create(email=email, first_name=first_name, interests=interests, ai_welcome=welcome)
    send_welcome(sub)
    return JsonResponse({"ok": True, "already": False, "message": "Inscription confirmée.", "welcome": welcome}, status=201)


@require_GET
def unsubscribe(request, token):
    sub = Subscriber.objects.filter(token=token).first()
    if sub and sub.is_active:
        sub.is_active = False
        sub.unsubscribed_at = timezone.now()
        sub.save(update_fields=["is_active", "unsubscribed_at"])
    return HttpResponseRedirect("/?desinscription=ok")


# --- Téléchargements --------------------------------------------------------

def download(request, platform):
    cfg = settings.AIRTRACK
    targets = {"android": cfg["PLAY_STORE_URL"], "ios": cfg["APP_STORE_URL"]}
    if platform not in {"apk", "android", "ios"}:
        raise Http404
    DownloadClick.objects.create(platform=platform, user_agent=request.META.get("HTTP_USER_AGENT", "")[:200])
    if platform == "apk":
        if cfg["APK_FILE"].exists():
            return FileResponse(cfg["APK_FILE"].open("rb"), as_attachment=True, filename="AirTrack.apk", content_type="application/vnd.android.package-archive")
        if cfg["APK_URL"]:
            return HttpResponseRedirect(cfg["APK_URL"])
        raise Http404("APK pas encore disponible")
    if not targets[platform]:
        raise Http404("Lien pas encore disponible")
    return HttpResponseRedirect(targets[platform])


# --- Application React ----------------------------------------------------

def spa(request):
    index = settings.FRONTEND_DIST / "index.html"
    if index.exists():
        return HttpResponse(index.read_text(encoding="utf-8"))
    return HttpResponse(
        "<h1>API AirTrack en marche</h1><p>En développement, ouvrez le site sur <a href='http://localhost:5173'>http://localhost:5173</a> (npm run dev dans frontend/).</p>",
        content_type="text/html; charset=utf-8",
    )
