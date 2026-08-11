from django.core.mail import EmailMessage
from django.conf import settings

from .pdf import generer_pdf_devis

TYPE_RDV_LABELS = {
    'appel': 'un appel téléphonique',
    'visio': 'une visioconférence',
    'sur_site': 'un rendez-vous sur site',
}


def envoyer_devis_par_email(devis):
    """Génère le PDF du devis et l'envoie par email au client."""
    pdf_bytes = generer_pdf_devis(devis)

    sujet = f"Votre devis #{devis.id} - {devis.client.entreprise or devis.client.nom}"
    corps = f"""Bonjour {devis.client.prenom or devis.client.nom},

Veuillez trouver ci-joint votre devis détaillé suite à notre échange.

Ce devis est valable 30 jours à compter de sa date d'émission.
N'hésitez pas à nous contacter pour toute question.

Cordialement,
L'équipe commerciale"""

    email = EmailMessage(
        subject=sujet,
        body=corps,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[devis.client.email],
    )
    email.attach(f"devis_{devis.id}.pdf", pdf_bytes, "application/pdf")
    email.send(fail_silently=False)


def envoyer_confirmation_rdv(rendez_vous):
    """Envoie un email de confirmation de rendez-vous au client (module Ligne directe)."""
    client = rendez_vous.client
    type_label = TYPE_RDV_LABELS.get(rendez_vous.type_rdv, rendez_vous.type_rdv)
    date_str = rendez_vous.date_rdv.strftime('%d/%m/%Y')
    heure_str = rendez_vous.heure_rdv.strftime('%H:%M')

    devis_ligne = ""
    if rendez_vous.devis_id:
        devis_ligne = f"\nCe rendez-vous concerne votre devis #{rendez_vous.devis_id}.\n"

    sujet = f"Confirmation de votre rendez-vous du {date_str} à {heure_str}"
    corps = f"""Bonjour {client.prenom or client.nom},

Nous vous confirmons {type_label} le {date_str} à {heure_str}.
{devis_ligne}
Notre équipe reviendra vers vous à ce créneau via notre ligne directe.
En cas d'indisponibilité, contactez-nous pour reprogrammer ce rendez-vous.

Cordialement,
L'équipe commerciale — 3LM Solutions"""

    email = EmailMessage(
        subject=sujet,
        body=corps,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[client.email],
    )
    email.send(fail_silently=False)