from django.contrib import admin
from .models import Client, Devis, LigneDevis, Prestation, RendezVous


class LigneDevisInline(admin.TabularInline):
    model = LigneDevis
    extra = 1


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('nom', 'prenom', 'entreprise', 'email', 'telephone', 'date_creation')
    search_fields = ('nom', 'entreprise', 'email')


@admin.register(Devis)
class DevisAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'manager', 'statut', 'estimation_montant', 'date_creation')
    list_filter = ('statut', 'date_creation')
    search_fields = ('client__nom', 'client__entreprise')
    inlines = [LigneDevisInline]


@admin.register(Prestation)
class PrestationAdmin(admin.ModelAdmin):
    list_display = ('nom', 'categorie', 'prix_reference', 'actif')
    list_filter = ('categorie', 'actif')
    search_fields = ('nom', 'description')


@admin.register(RendezVous)
class RendezVousAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'devis', 'date_rdv', 'heure_rdv', 'type_rdv', 'statut')
    list_filter = ('statut', 'type_rdv', 'date_rdv')
    search_fields = ('client__nom', 'client__entreprise')