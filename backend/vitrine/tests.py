import json
from unittest import mock

from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings

from .models import AssistantLog, NewsletterIssue, Subscriber


class ApiTests(TestCase):
    def setUp(self):
        cache.clear()

    def post(self, url, data):
        return self.client.post(url, json.dumps(data), content_type="application/json")

    def test_health_and_config(self):
        self.assertEqual(self.client.get("/api/health/").json()["status"], "ok")
        cfg = self.client.get("/api/config/").json()
        self.assertEqual(len(cfg["plans"]), 3)
        self.assertIn("downloads", cfg)
        self.assertIn("csrftoken", self.client.cookies)

    def test_assistant_falls_back_to_faq_without_key(self):
        res = self.post("/api/assistant/", {"messages": [{"role": "user", "content": "Combien coûte le plan Pro ?"}]})
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertEqual(body["source"], "faq")
        self.assertIn("2 500", body["reply"])
        self.assertEqual(AssistantLog.objects.count(), 1)

    def test_assistant_uses_ai_when_configured(self):
        with mock.patch("vitrine.ai.ai_enabled", return_value=True), mock.patch("vitrine.ai._complete", return_value="Réponse IA") as complete:
            res = self.post("/api/assistant/", {"messages": [{"role": "assistant", "content": "Bonjour"}, {"role": "user", "content": "Ça marche en 2G ?"}]})
        self.assertEqual(res.json(), {"reply": "Réponse IA", "source": "ai"})
        sent_messages = complete.call_args[0][1]
        self.assertEqual(sent_messages[0]["role"], "user")  # le message d'accueil de l'assistant est retiré

    def test_assistant_rejects_empty(self):
        self.assertEqual(self.post("/api/assistant/", {"messages": []}).status_code, 400)

    def test_subscribe_then_unsubscribe(self):
        res = self.post("/api/newsletter/subscribe/", {"email": "Awa@Exemple.ci", "first_name": "Awa", "interests": ["securite", "inconnu"]})
        self.assertEqual(res.status_code, 201)
        sub = Subscriber.objects.get()
        self.assertEqual(sub.email, "awa@exemple.ci")
        self.assertEqual(sub.interests, ["securite"])
        self.assertTrue(res.json()["welcome"])
        self.assertEqual(len(mail.outbox), 1)

        again = self.post("/api/newsletter/subscribe/", {"email": "awa@exemple.ci"})
        self.assertTrue(again.json()["already"])

        self.client.get(f"/api/newsletter/unsubscribe/{sub.token}/")
        sub.refresh_from_db()
        self.assertFalse(sub.is_active)

    def test_subscribe_invalid_email(self):
        self.assertEqual(self.post("/api/newsletter/subscribe/", {"email": "pas-un-email"}).status_code, 400)

    def test_honeypot(self):
        self.post("/api/newsletter/subscribe/", {"email": "robot@spam.ci", "website": "http://spam"})
        self.assertFalse(Subscriber.objects.exists())

    def test_send_issue(self):
        from .emails import send_issue

        Subscriber.objects.create(email="a@b.ci", first_name="Koffi")
        issue = NewsletterIssue.objects.create(subject="Test", body="Bonjour {prénom},\nNouveautés.")
        self.assertEqual(send_issue(issue, Subscriber.objects.filter(is_active=True)), 1)
        self.assertIn("Bonjour Koffi,", mail.outbox[0].body)
        self.assertIn("/api/newsletter/unsubscribe/", mail.outbox[0].body)

    @override_settings(AIRTRACK={**__import__("django.conf").conf.settings.AIRTRACK, "PLAY_STORE_URL": "https://play.google.com/x"})
    def test_download_redirect(self):
        res = self.client.get("/download/android/")
        self.assertEqual(res.status_code, 302)
        self.assertEqual(self.client.get("/download/ios/").status_code, 404)
