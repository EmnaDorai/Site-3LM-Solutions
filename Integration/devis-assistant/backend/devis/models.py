from django.db import models
from django.contrib.auth.models import User
from django.db.models import Q, UniqueConstraint


class Client(models.Model):
    STATUT_CHOICES = [
        ('nouveau', 'Nouveau prospect'),
        ('contacte', 'Contacté'),
        ('qualifie', 'Qualifié (devis en cours)'),
        ('client', 'Client (devis envoyé)'),
        ('perdu', 'Perdu'),
    ]

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100, blank=True)
    entreprise = models.CharField(max_length=200, blank=True)
    email = models.EmailField()
    telephone = models.CharField(max_length=20)
    message = models.TextField(blank=True, help_text="Message initial laissé via le formulaire public")
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='nouveau')
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} - {self.entreprise}"


class Devis(models.Model):
    STATUT_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('en_attente', 'En attente de validation'),
        ('valide', 'Validé'),
        ('envoye', 'Envoyé au client'),
        ('refuse', 'Refusé'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='devis')
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    besoins_client = models.TextField(help_text="Notes brutes prises pendant l'appel")
    synthese_ia = models.TextField(blank=True, help_text="Résumé généré par l'IA")
    estimation_montant = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='brouillon')
    fichier_pdf = models.FileField(upload_to='devis_pdf/', null=True, blank=True)

    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Devis #{self.id} - {self.client.nom}"


class Prestation(models.Model):
    CATEGORIE_CHOICES = [
        ('developpement', 'Développement'),
        ('design', 'Design / UI-UX'),
        ('infrastructure', 'Infrastructure / DevOps'),
        ('formation', 'Formation / Accompagnement'),
        ('maintenance', 'Maintenance / Support'),
        ('autre', 'Autre'),
    ]

    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    categorie = models.CharField(max_length=20, choices=CATEGORIE_CHOICES, default='autre')
    prix_reference = models.DecimalField(max_digits=10, decimal_places=2, help_text="Prix de référence en TND")
    actif = models.BooleanField(default=True, help_text="Décoche pour retirer du catalogue sans supprimer l'historique")

    def __str__(self):
        return f"{self.nom} ({self.prix_reference} TND)"

    class Meta:
        verbose_name_plural = "Prestations"


class LigneDevis(models.Model):
    devis = models.ForeignKey(Devis, on_delete=models.CASCADE, related_name='lignes')
    prestation = models.ForeignKey(
        Prestation, on_delete=models.SET_NULL, null=True, blank=True, related_name='lignes_devis'
    )
    description = models.CharField(max_length=255)
    quantite = models.PositiveIntegerField(default=1)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def total(self):
        return self.quantite * self.prix_unitaire

    def __str__(self):
        return f"{self.description} x{self.quantite}"


class RendezVous(models.Model):
    TYPE_CHOICES = [
        ('appel', 'Appel téléphonique'),
        ('visio', 'Visioconférence'),
        ('sur_site', 'Sur site'),
    ]
    STATUT_CHOICES = [
        ('demande', 'Demandé'),
        ('confirme', 'Confirmé'),
        ('annule', 'Annulé'),
        ('termine', 'Terminé'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='rendez_vous')
    devis = models.ForeignKey(
        Devis, on_delete=models.SET_NULL, null=True, blank=True, related_name='rendez_vous',
        help_text="Devis concerné par ce rendez-vous (facultatif)",
    )
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    SOURCE_CHOICES = [
        ('interne', 'Proposé par le manager'),
        ('public', 'Demandé par le visiteur (formulaire en ligne)'),
    ]

    date_rdv = models.DateField()
    heure_rdv = models.TimeField()
    type_rdv = models.CharField(max_length=20, choices=TYPE_CHOICES, default='appel')
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='demande')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='interne')
    notes = models.TextField(blank=True, help_text="Objet de l'appel / sujet à aborder")

    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_rdv', '-heure_rdv']
        verbose_name = "Rendez-vous"
        verbose_name_plural = "Rendez-vous (Ligne directe)"
        constraints = [
            UniqueConstraint(
                fields=['date_rdv', 'heure_rdv'],
                condition=Q(statut__in=['demande', 'confirme']),
                name='creneau_unique_actif',
            ),
        ]

    def __str__(self):
        return f"RDV #{self.id} - {self.client.nom} ({self.date_rdv} {self.heure_rdv})"