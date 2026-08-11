from rest_framework import serializers

from .models import Prospect, RendezVous


class ProspectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prospect
        fields = [
            "id",
            "prenom",
            "nom",
            "email",
            "telephone",
            "entreprise",
            "message",
            "statut",
            "date_creation",
            "date_mise_a_jour",
        ]
        read_only_fields = ["id", "date_creation", "date_mise_a_jour"]


class RendezVousSerializer(serializers.ModelSerializer):
    """Utilisé pour la lecture (liste / détail côté administrateur)."""

    prospect = ProspectSerializer(read_only=True)

    class Meta:
        model = RendezVous
        fields = [
            "id",
            "prospect",
            "date",
            "heure",
            "statut",
            "email_confirmation_envoye",
            "date_creation",
            "date_mise_a_jour",
        ]
        read_only_fields = [
            "id",
            "email_confirmation_envoye",
            "date_creation",
            "date_mise_a_jour",
        ]


class RendezVousCreationSerializer(serializers.Serializer):
    """Utilisé par le formulaire public : crée (ou réutilise) un prospect
    et son rendez-vous en une seule requête."""

    prenom = serializers.CharField(max_length=100)
    nom = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    telephone = serializers.CharField(max_length=30)
    entreprise = serializers.CharField(max_length=150, required=False, allow_blank=True)
    message = serializers.CharField(required=False, allow_blank=True)
    date = serializers.DateField()
    heure = serializers.TimeField()

    def validate(self, attrs):
        creneau_pris = RendezVous.objects.filter(
            date=attrs["date"],
            heure=attrs["heure"],
            statut__in=[RendezVous.Statut.EN_ATTENTE, RendezVous.Statut.CONFIRME],
        ).exists()
        if creneau_pris:
            raise serializers.ValidationError(
                "Ce créneau vient d'être réservé par une autre personne. "
                "Merci d'en choisir un autre."
            )
        return attrs

    def create(self, validated_data):
        prospect = Prospect.objects.create(
            prenom=validated_data["prenom"],
            nom=validated_data["nom"],
            email=validated_data["email"],
            telephone=validated_data["telephone"],
            entreprise=validated_data.get("entreprise", ""),
            message=validated_data.get("message", ""),
        )
        rendez_vous = RendezVous.objects.create(
            prospect=prospect,
            date=validated_data["date"],
            heure=validated_data["heure"],
        )
        return rendez_vous


class RendezVousUpdateSerializer(serializers.ModelSerializer):
    """Utilisé par l'administrateur pour modifier/confirmer un rendez-vous."""

    class Meta:
        model = RendezVous
        fields = ["date", "heure", "statut"]
