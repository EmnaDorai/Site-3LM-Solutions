from rest_framework import serializers
from .models import Client, Devis, LigneDevis, Prestation, RendezVous


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class PrestationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prestation
        fields = ['id', 'nom', 'description', 'categorie', 'prix_reference', 'actif']


class LigneDevisSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()
    prestation_nom = serializers.CharField(source='prestation.nom', read_only=True, default=None)

    class Meta:
        model = LigneDevis
        fields = ['id', 'prestation', 'prestation_nom', 'description', 'quantite', 'prix_unitaire', 'total']


class DevisSerializer(serializers.ModelSerializer):
    lignes = LigneDevisSerializer(many=True, required=False)
    client_nom = serializers.CharField(source='client.nom', read_only=True)

    class Meta:
        model = Devis
        fields = [
            'id', 'client', 'client_nom', 'manager',
            'besoins_client', 'synthese_ia', 'estimation_montant',
            'statut', 'fichier_pdf', 'date_creation', 'date_modification',
            'lignes',
        ]

    def create(self, validated_data):
        lignes_data = validated_data.pop('lignes', [])
        devis = Devis.objects.create(**validated_data)
        for ligne_data in lignes_data:
            LigneDevis.objects.create(devis=devis, **ligne_data)
        return devis

    def update(self, instance, validated_data):
        lignes_data = validated_data.pop('lignes', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if lignes_data is not None:
            instance.lignes.all().delete()
            for ligne_data in lignes_data:
                LigneDevis.objects.create(devis=instance, **ligne_data)

        return instance


class RendezVousSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    client_entreprise = serializers.CharField(source='client.entreprise', read_only=True)
    client_telephone = serializers.CharField(source='client.telephone', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    devis_statut = serializers.CharField(source='devis.statut', read_only=True, default=None)

    class Meta:
        model = RendezVous
        fields = [
            'id', 'client', 'client_nom', 'client_entreprise', 'client_telephone', 'client_email',
            'devis', 'devis_statut', 'manager',
            'date_rdv', 'heure_rdv', 'type_rdv', 'statut', 'notes',
            'date_creation', 'date_modification',
        ]