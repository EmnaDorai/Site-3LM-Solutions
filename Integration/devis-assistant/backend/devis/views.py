from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Client, Devis, LigneDevis, Prestation, RendezVous
from .serializers import (
    ClientSerializer, DevisSerializer, LigneDevisSerializer, PrestationSerializer,
    RendezVousSerializer, RendezVousPublicSerializer,
)
from .services.ia import generer_devis_ia
from .services.pdf import generer_pdf_devis
from .services.email import (
    envoyer_devis_par_email, envoyer_confirmation_rdv, envoyer_proposition_rdv, envoyer_demande_rdv_public,
)

class ClientViewSet(viewsets.ModelViewSet):
    """Gestion des prospects/clients — fiches créées via le formulaire public, un appel, ou un devis."""

    serializer_class = ClientSerializer

    def get_queryset(self):
        qs = Client.objects.all().order_by('-date_creation')
        params = self.request.query_params
        search = params.get('search')
        statut = params.get('statut')
        if search:
            qs = qs.filter(
                models.Q(nom__icontains=search)
                | models.Q(prenom__icontains=search)
                | models.Q(email__icontains=search)
                | models.Q(entreprise__icontains=search)
                | models.Q(telephone__icontains=search)
            )
        if statut:
            qs = qs.filter(statut=statut)
        return qs


class PrestationViewSet(viewsets.ModelViewSet):
    queryset = Prestation.objects.filter(actif=True).order_by('categorie', 'nom')
    serializer_class = PrestationSerializer


class DevisViewSet(viewsets.ModelViewSet):
    queryset = Devis.objects.all().order_by('-date_creation')
    serializer_class = DevisSerializer

    def perform_create(self, serializer):
        devis = serializer.save(manager=self.request.user if self.request.user.is_authenticated else None)
        # Le prospect entre en phase de qualification dès qu'un devis est ouvert pour lui.
        if devis.client.statut == 'nouveau':
            devis.client.statut = 'qualifie'
            devis.client.save(update_fields=['statut'])

    @action(detail=True, methods=['post'])
    def generer_ia(self, request, pk=None):
        """Génère synthèse, lignes et estimation via l'IA."""
        devis = self.get_object()
        instructions = request.data.get('instructions', '')

        besoins = devis.besoins_client
        if instructions:
            besoins = f"{besoins}\n\nInstructions supplémentaires :\n{instructions}"

        try:
            result = generer_devis_ia(besoins, devis.client.nom)
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            return Response(
                {'error': f"Erreur lors de la génération IA : {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        devis.synthese_ia = result.get('synthese', '')
        estimation = result.get('estimation_montant')
        if estimation is not None:
            devis.estimation_montant = estimation
        devis.save()

        devis.lignes.all().delete()
        for ligne in result.get('lignes', []):
            LigneDevis.objects.create(
                devis=devis,
                prestation_id=ligne.get('prestation_id'),
                description=ligne['description'],
                quantite=ligne.get('quantite', 1),
                prix_unitaire=ligne['prix_unitaire'],
            )

        devis.refresh_from_db()
        return Response(DevisSerializer(devis).data)

    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        """Valide le devis, génère le PDF et l'envoie automatiquement au client."""
        devis = self.get_object()

        if not devis.lignes.exists():
            return Response(
                {'error': "Impossible de valider un devis sans lignes."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        devis.statut = 'valide'
        devis.save()

        try:
            envoyer_devis_par_email(devis)
            devis.statut = 'envoye'
            devis.save()
            if devis.client.statut != 'perdu':
                devis.client.statut = 'client'
                devis.client.save(update_fields=['statut'])
        except Exception as exc:
            # Le devis reste "validé" même si l'envoi échoue — le manager peut réessayer
            return Response(
                {
                    'status': 'devis validé mais email non envoyé',
                    'error': str(exc),
                    'devis': DevisSerializer(devis).data,
                },
                status=status.HTTP_207_MULTI_STATUS,
            )

        return Response({'status': 'devis validé et envoyé au client', 'devis': DevisSerializer(devis).data})

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Endpoint : GET /api/devis/{id}/pdf/ — télécharge le devis en PDF (uniquement si validé)."""
        devis = self.get_object()

        if devis.statut not in ('valide', 'envoye'):
            return Response(
                {'error': "Le devis doit être validé avant de pouvoir être téléchargé en PDF."},
                status=status.HTTP_403_FORBIDDEN,
            )

        pdf_bytes = generer_pdf_devis(devis)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="devis_{devis.id}.pdf"'
        return response


class RendezVousViewSet(viewsets.ModelViewSet):
    """Module « Ligne directe » : prise de rendez-vous, rattachée ou non à un devis."""

    serializer_class = RendezVousSerializer

    def get_queryset(self):
        qs = RendezVous.objects.all().select_related('client', 'devis')
        params = self.request.query_params
        devis_id = params.get('devis')
        client_id = params.get('client')
        statut = params.get('statut')
        if devis_id:
            qs = qs.filter(devis_id=devis_id)
        if client_id:
            qs = qs.filter(client_id=client_id)
        if statut:
            qs = qs.filter(statut=statut)
        return qs

    def get_permissions(self):
        if self.action in ('public', 'creneaux'):
            return [AllowAny()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(manager=self.request.user if self.request.user.is_authenticated else None)

    def create(self, request, *args, **kwargs):
        """Crée le rendez-vous puis prévient le client par email de la proposition de créneau."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        data = dict(serializer.data)
        try:
            envoyer_proposition_rdv(serializer.instance)
        except Exception as exc:
            data['email_warning'] = f"Rendez-vous créé mais email de proposition non envoyé : {exc}"

        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['post'])
    def public(self, request):
        """POST /api/rendezvous/public/ — formulaire public du site (aucune authentification requise).

        Crée (ou retrouve) le prospect et son rendez-vous, puis lui envoie un accusé de réception.
        """
        serializer = RendezVousPublicSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rendez_vous = serializer.save()

        email_envoye = True
        try:
            envoyer_demande_rdv_public(rendez_vous)
        except Exception:
            email_envoye = False

        data = RendezVousSerializer(rendez_vous).data
        data['email_envoye'] = email_envoye
        return Response(data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def creneaux(self, request):
        """GET /api/rendezvous/creneaux/?date=YYYY-MM-DD — créneaux déjà pris pour une date donnée."""
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': "Paramètre 'date' requis."}, status=status.HTTP_400_BAD_REQUEST)
        pris = RendezVous.objects.filter(
            date_rdv=date_str, statut__in=['demande', 'confirme'],
        ).values_list('heure_rdv', flat=True)
        return Response({'date': date_str, 'creneaux_pris': [h.strftime('%H:%M') for h in pris]})

    @action(detail=True, methods=['post'])
    def confirmer(self, request, pk=None):
        """Confirme le rendez-vous et tente d'envoyer un email de confirmation au client."""
        rdv = self.get_object()
        rdv.statut = 'confirme'
        rdv.save()

        try:
            envoyer_confirmation_rdv(rdv)
        except Exception as exc:
            return Response(
                {
                    'status': 'rendez-vous confirmé mais email non envoyé',
                    'error': str(exc),
                    'rendez_vous': RendezVousSerializer(rdv).data,
                },
                status=status.HTTP_207_MULTI_STATUS,
            )

        return Response({'status': 'rendez-vous confirmé et email envoyé au client', 'rendez_vous': RendezVousSerializer(rdv).data})

    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        rdv = self.get_object()
        rdv.statut = 'annule'
        rdv.save()
        return Response(RendezVousSerializer(rdv).data)

    @action(detail=True, methods=['post'])
    def terminer(self, request, pk=None):
        rdv = self.get_object()
        rdv.statut = 'termine'
        rdv.save()
        return Response(RendezVousSerializer(rdv).data)