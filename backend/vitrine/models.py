import uuid

from django.db import models

INTERESTS = {
    "app": "Nouveautés de l'application",
    "securite": "Conseils sécurité",
    "offres": "Offres et promotions",
    "flottes": "Flottes et entreprises",
}


class Subscriber(models.Model):
    email = models.EmailField("e-mail", unique=True)
    first_name = models.CharField("prénom", max_length=60, blank=True)
    interests = models.JSONField("centres d'intérêt", default=list, blank=True)
    source = models.CharField("provenance", max_length=40, default="site")
    ai_welcome = models.TextField("message de bienvenue", blank=True)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_active = models.BooleanField("abonné", default=True)
    created_at = models.DateTimeField("inscrit le", auto_now_add=True)
    unsubscribed_at = models.DateTimeField("désinscrit le", null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "abonné newsletter"
        verbose_name_plural = "abonnés newsletter"

    def __str__(self):
        return self.email

    @property
    def interests_label(self):
        return ", ".join(INTERESTS.get(code, code) for code in self.interests) or "—"


class NewsletterIssue(models.Model):
    DRAFT, SENT = "draft", "sent"
    STATUS = [(DRAFT, "Brouillon"), (SENT, "Envoyée")]

    subject = models.CharField("objet", max_length=150)
    topic = models.TextField("sujet pour l'IA", blank=True, help_text="Quelques mots : l'IA rédige le corps à partir de ce sujet (action « Rédiger avec l'IA »).")
    body = models.TextField("contenu", blank=True)
    status = models.CharField("statut", max_length=10, choices=STATUS, default=DRAFT)
    recipients_count = models.PositiveIntegerField("destinataires", default=0)
    sent_at = models.DateTimeField("envoyée le", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "newsletter"
        verbose_name_plural = "newsletters"

    def __str__(self):
        return self.subject


class AssistantLog(models.Model):
    question = models.TextField()
    answer = models.TextField()
    source = models.CharField(max_length=10, help_text="ai = Claude, faq = réponse de secours")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "question à l'assistant"
        verbose_name_plural = "questions à l'assistant"

    def __str__(self):
        return self.question[:80]


class DownloadClick(models.Model):
    PLATFORMS = [("apk", "APK Android"), ("android", "Google Play"), ("ios", "App Store")]

    platform = models.CharField(max_length=10, choices=PLATFORMS)
    user_agent = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "téléchargement"
        verbose_name_plural = "téléchargements"

    def __str__(self):
        return f"{self.get_platform_display()} · {self.created_at:%d/%m/%Y %H:%M}"
