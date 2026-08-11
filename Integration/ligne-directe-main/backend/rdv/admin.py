from django.contrib import admin

from .models import Prospect, RendezVous


@admin.register(Prospect)
class ProspectAdmin(admin.ModelAdmin):
    list_display = ("prenom", "nom", "email", "telephone", "entreprise", "statut", "date_creation")
    list_filter = ("statut",)
    search_fields = ("prenom", "nom", "email", "entreprise", "telephone")


@admin.register(RendezVous)
class RendezVousAdmin(admin.ModelAdmin):
    list_display = ("prospect", "date", "heure", "statut", "email_confirmation_envoye")
    list_filter = ("statut", "date")
    search_fields = ("prospect__prenom", "prospect__nom", "prospect__email")
    actions = ["confirmer_rendez_vous"]

    @admin.action(description="Confirmer les rendez-vous sélectionnés")
    def confirmer_rendez_vous(self, request, queryset):
        queryset.update(statut=RendezVous.Statut.CONFIRME)
