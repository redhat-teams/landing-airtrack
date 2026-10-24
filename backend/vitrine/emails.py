"""Envoi des e-mails de la newsletter (bienvenue + numéros), avec lien de désinscription personnel."""
import logging

from django.conf import settings
from django.core.mail import EmailMessage, get_connection
from django.utils import timezone

logger = logging.getLogger(__name__)


def unsubscribe_url(subscriber):
    base = settings.AIRTRACK["PUBLIC_SITE_URL"].rstrip("/")
    return f"{base}/api/newsletter/unsubscribe/{subscriber.token}/"


def _footer(subscriber):
    return f"\n\n—\nAirTrack · suivi GPS en temps réel\nSe désinscrire : {unsubscribe_url(subscriber)}"


def send_welcome(subscriber):
    body = f"Bonjour{' ' + subscriber.first_name if subscriber.first_name else ''},\n\n{subscriber.ai_welcome}{_footer(subscriber)}"
    try:
        EmailMessage("Bienvenue chez AirTrack", body, settings.DEFAULT_FROM_EMAIL, [subscriber.email]).send(fail_silently=False)
    except Exception:
        logger.exception("E-mail de bienvenue non envoyé à %s", subscriber.email)


def send_issue(issue, subscribers):
    """Envoie la newsletter à chaque abonné actif (un message par personne pour le prénom et la désinscription)."""
    messages = []
    for sub in subscribers:
        body = issue.body.replace("{prénom}", sub.first_name or "").replace("Bonjour ,", "Bonjour,")
        messages.append(EmailMessage(issue.subject, body + _footer(sub), settings.DEFAULT_FROM_EMAIL, [sub.email]))
    sent = 0
    if messages:
        with get_connection() as connection:
            sent = connection.send_messages(messages) or 0
    issue.status = issue.SENT
    issue.sent_at = timezone.now()
    issue.recipients_count = sent
    issue.save(update_fields=["status", "sent_at", "recipients_count"])
    return sent
