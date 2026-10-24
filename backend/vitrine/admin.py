import csv

from django.contrib import admin, messages
from django.http import HttpResponse

from . import ai
from .emails import send_issue
from .models import AssistantLog, DownloadClick, NewsletterIssue, Subscriber


@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "first_name", "interests_label", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("email", "first_name")
    readonly_fields = ("token", "created_at", "unsubscribed_at", "ai_welcome")
    actions = ["export_csv"]

    @admin.display(description="centres d'intérêt")
    def interests_label(self, obj):
        return obj.interests_label

    @admin.action(description="Exporter en CSV")
    def export_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="abonnes-airtrack.csv"'
        response.write("﻿")
        writer = csv.writer(response, delimiter=";")
        writer.writerow(["email", "prenom", "interets", "abonne", "inscrit_le"])
        for sub in queryset:
            writer.writerow([sub.email, sub.first_name, sub.interests_label, "oui" if sub.is_active else "non", sub.created_at.strftime("%d/%m/%Y %H:%M")])
        return response


@admin.register(NewsletterIssue)
class NewsletterIssueAdmin(admin.ModelAdmin):
    list_display = ("subject", "status", "recipients_count", "sent_at", "created_at")
    list_filter = ("status",)
    readonly_fields = ("status", "recipients_count", "sent_at")
    actions = ["draft_with_ai", "send_now"]

    @admin.action(description="Rédiger avec l'IA (à partir du sujet)")
    def draft_with_ai(self, request, queryset):
        if not ai.ai_enabled():
            self.message_user(request, "Ajoutez ANTHROPIC_API_KEY dans les variables d'environnement pour rédiger avec l'IA.", messages.ERROR)
            return
        done = 0
        for issue in queryset.filter(status=NewsletterIssue.DRAFT):
            try:
                issue.body = ai.draft_newsletter(issue.subject, issue.topic)
                issue.save(update_fields=["body"])
                done += 1
            except Exception as exc:  # noqa: BLE001
                self.message_user(request, f"« {issue.subject} » : rédaction impossible ({exc}).", messages.ERROR)
        if done:
            self.message_user(request, f"{done} brouillon(s) rédigé(s). Relisez-les avant l'envoi.", messages.SUCCESS)

    @admin.action(description="Envoyer maintenant aux abonnés actifs")
    def send_now(self, request, queryset):
        subscribers = list(Subscriber.objects.filter(is_active=True))
        for issue in queryset.filter(status=NewsletterIssue.DRAFT):
            if not issue.body.strip():
                self.message_user(request, f"« {issue.subject} » est vide : rédigez-la d'abord.", messages.WARNING)
                continue
            sent = send_issue(issue, subscribers)
            self.message_user(request, f"« {issue.subject} » envoyée à {sent} abonné(s).", messages.SUCCESS)


@admin.register(AssistantLog)
class AssistantLogAdmin(admin.ModelAdmin):
    list_display = ("question_short", "source", "created_at")
    list_filter = ("source", "created_at")
    search_fields = ("question", "answer")
    readonly_fields = ("question", "answer", "source", "created_at")

    @admin.display(description="question")
    def question_short(self, obj):
        return obj.question[:90]

    def has_add_permission(self, request):
        return False


@admin.register(DownloadClick)
class DownloadClickAdmin(admin.ModelAdmin):
    list_display = ("platform", "created_at", "user_agent")
    list_filter = ("platform", "created_at")
    readonly_fields = ("platform", "user_agent", "created_at")

    def has_add_permission(self, request):
        return False
