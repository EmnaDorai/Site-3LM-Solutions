"""Fonctions d'envoi d'emails liés aux rendez-vous.

L'envoi utilise le système d'email intégré de Django (django.core.mail),
ce qui permet de brancher n'importe quel backend SMTP réel (Gmail, SendGrid,
Mailgun, OVH, etc.) simplement via les variables d'environnement définies
dans settings.py / .env — aucun changement de code n'est nécessaire pour
passer de la démo (console) à un envoi réel.
"""

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string


def envoyer_confirmation_rendez_vous(rendez_vous):
    """Envoie l'email de confirmation automatique au prospect.

    Retourne True si l'email a été envoyé (ou mis en file d'attente) avec
    succès, False sinon. Les erreurs sont journalisées mais ne bloquent pas
    la création du rendez-vous côté API.
    """
    prospect = rendez_vous.prospect

    contexte = {
        "prenom": prospect.prenom,
        "nom": prospect.nom,
        "date": rendez_vous.date.strftime("%d/%m/%Y"),
        "heure": rendez_vous.heure.strftime("%H:%M"),
        "entreprise": prospect.entreprise,
        "telephone": prospect.telephone,
    }

    sujet = "Confirmation de votre rendez-vous téléphonique"
    corps_texte = render_to_string("emails/confirmation_rdv.txt", contexte)
    try:
        send_mail(
            subject=sujet,
            message=corps_texte,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[prospect.email],
            fail_silently=False,
        )
        rendez_vous.email_confirmation_envoye = True
        rendez_vous.save(update_fields=["email_confirmation_envoye"])
        return True

    except Exception as exc :
        print("===================================")
        print("ERREUR EMAIL :")
        print(exc)
        print("===================================")
        return False
