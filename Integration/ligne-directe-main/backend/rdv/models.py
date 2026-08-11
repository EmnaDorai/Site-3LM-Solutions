from django.db import models


class Prospect(models.Model):
    """Un prospect ayant rempli le formulaire de contact / prise de rendez-vous."""

    class Statut(models.TextChoices):
        NOUVEAU = "nouveau", "Nouveau"
        CONTACTE = "contacte", "Contacté"
        QUALIFIE = "qualifie", "Qualifié"
        PERDU = "perdu", "Perdu"

    prenom = models.CharField("Prénom", max_length=100)
    nom = models.CharField("Nom", max_length=100)
    email = models.EmailField("Email")
    telephone = models.CharField("Téléphone", max_length=30)
    entreprise = models.CharField("Entreprise", max_length=150, blank=True)
    message = models.TextField("Message", blank=True)
    statut = models.CharField(
        "Statut", max_length=20, choices=Statut.choices, default=Statut.NOUVEAU
    )
    date_creation = models.DateTimeField("Créé le", auto_now_add=True)
    date_mise_a_jour = models.DateTimeField("Mis à jour le", auto_now=True)

    class Meta:
        verbose_name = "Prospect"
        verbose_name_plural = "Prospects"
        ordering = ["-date_creation"]

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.email})"


class RendezVous(models.Model):
    """Un rendez-vous téléphonique demandé par un prospect."""

    class Statut(models.TextChoices):
        EN_ATTENTE = "en_attente", "En attente"
        CONFIRME = "confirme", "Confirmé"
        ANNULE = "annule", "Annulé"

    prospect = models.ForeignKey(
        Prospect, on_delete=models.CASCADE, related_name="rendez_vous"
    )
    date = models.DateField("Date du rendez-vous")
    heure = models.TimeField("Heure du rendez-vous")
    statut = models.CharField(
        "Statut", max_length=20, choices=Statut.choices, default=Statut.EN_ATTENTE
    )
    email_confirmation_envoye = models.BooleanField(
        "Email de confirmation envoyé", default=False
    )
    date_creation = models.DateTimeField("Créé le", auto_now_add=True)
    date_mise_a_jour = models.DateTimeField("Mis à jour le", auto_now=True)

    class Meta:
        verbose_name = "Rendez-vous"
        verbose_name_plural = "Rendez-vous"
        ordering = ["date", "heure"]
        constraints = [
            models.UniqueConstraint(
                fields=["date", "heure"],
                condition=models.Q(statut__in=["en_attente", "confirme"]),
                name="creneau_unique_actif",
            )
        ]

    def __str__(self):
        return f"{self.prospect} — {self.date} {self.heure}"
