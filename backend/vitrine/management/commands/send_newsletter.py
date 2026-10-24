from django.core.management.base import BaseCommand, CommandError

from vitrine import ai
from vitrine.emails import send_issue
from vitrine.models import NewsletterIssue, Subscriber


class Command(BaseCommand):
    help = "Rédige (optionnel, avec l'IA) puis envoie une newsletter aux abonnés actifs."

    def add_arguments(self, parser):
        parser.add_argument("--issue", type=int, help="ID d'une newsletter existante (admin)")
        parser.add_argument("--subject", help="Objet d'une nouvelle newsletter")
        parser.add_argument("--topic", default="", help="Sujet à développer par l'IA")
        parser.add_argument("--dry-run", action="store_true", help="Affiche le texte sans rien envoyer")

    def handle(self, *args, **opts):
        if opts["issue"]:
            issue = NewsletterIssue.objects.filter(pk=opts["issue"]).first()
            if not issue:
                raise CommandError("Newsletter introuvable")
        elif opts["subject"]:
            issue = NewsletterIssue.objects.create(subject=opts["subject"], topic=opts["topic"])
        else:
            raise CommandError("Indiquez --issue ID ou --subject \"…\"")

        if issue.status == NewsletterIssue.SENT:
            raise CommandError("Cette newsletter a déjà été envoyée")
        if not issue.body.strip():
            if not ai.ai_enabled():
                raise CommandError("Corps vide et ANTHROPIC_API_KEY absente : rédigez le texte dans l'admin")
            issue.body = ai.draft_newsletter(issue.subject, issue.topic)
            issue.save(update_fields=["body"])

        self.stdout.write(f"Objet : {issue.subject}\n\n{issue.body}\n")
        subscribers = Subscriber.objects.filter(is_active=True)
        if opts["dry_run"]:
            self.stdout.write(self.style.WARNING(f"Simulation : {subscribers.count()} abonné(s) l'auraient reçue."))
            return
        sent = send_issue(issue, subscribers)
        self.stdout.write(self.style.SUCCESS(f"Envoyée à {sent} abonné(s)."))
