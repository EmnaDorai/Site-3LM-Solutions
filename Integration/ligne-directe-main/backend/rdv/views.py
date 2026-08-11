from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .emails import envoyer_confirmation_rendez_vous
from .models import Prospect, RendezVous
from .serializers import (
    ProspectSerializer,
    RendezVousCreationSerializer,
    RendezVousSerializer,
    RendezVousUpdateSerializer,
)


class CreneauxDisponiblesView(viewsets.ViewSet):
    """GET /api/creneaux-disponibles/?date=YYYY-MM-DD
    Retourne les créneaux déjà pris pour une date donnée, afin que le
    frontend puisse désactiver les créneaux indisponibles."""

    permission_classes = [permissions.AllowAny]

    def list(self, request):
        date_param = request.query_params.get("date")
        if not date_param:
            return Response(
                {"detail": "Le paramètre 'date' est requis (YYYY-MM-DD)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        pris = RendezVous.objects.filter(
            date=date_param,
            statut__in=[RendezVous.Statut.EN_ATTENTE, RendezVous.Statut.CONFIRME],
        ).values_list("heure", flat=True)
        return Response({"date": date_param, "creneaux_pris": [h.strftime("%H:%M") for h in pris]})


class RendezVousViewSet(viewsets.ModelViewSet):
    """
    - POST   /api/rendez-vous/                -> réservation publique (visiteur), envoie l'email
    - GET    /api/rendez-vous/                -> liste (admin), avec ?search=&statut=&date=
    - GET    /api/rendez-vous/{id}/           -> détail (admin)
    - PATCH  /api/rendez-vous/{id}/           -> modification (admin) : date, heure, statut
    - DELETE /api/rendez-vous/{id}/           -> suppression (admin)
    - POST   /api/rendez-vous/{id}/confirmer/ -> confirmation rapide (admin)
    """

    queryset = RendezVous.objects.select_related("prospect").all()

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_serializer_class(self):
        if self.action == "create":
            return RendezVousCreationSerializer
        if self.action in ("update", "partial_update"):
            return RendezVousUpdateSerializer
        return RendezVousSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        recherche = params.get("search")
        if recherche:
            qs = qs.filter(
                Q(prospect__prenom__icontains=recherche)
                | Q(prospect__nom__icontains=recherche)
                | Q(prospect__email__icontains=recherche)
                | Q(prospect__entreprise__icontains=recherche)
                | Q(prospect__telephone__icontains=recherche)
            )

        statut = params.get("statut")
        if statut:
            qs = qs.filter(statut=statut)

        date_param = params.get("date")
        if date_param:
            qs = qs.filter(date=date_param)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rendez_vous = serializer.save()

        email_envoye = envoyer_confirmation_rendez_vous(rendez_vous)

        return Response(
            {
                **RendezVousSerializer(rendez_vous).data,
                "email_envoye": email_envoye,
            },
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(RendezVousSerializer(instance).data)

    @action(detail=True, methods=["post"])
    def confirmer(self, request, pk=None):
        """Action dédiée pour confirmer un rendez-vous en un clic."""
        rendez_vous = self.get_object()
        rendez_vous.statut = RendezVous.Statut.CONFIRME
        rendez_vous.save(update_fields=["statut", "date_mise_a_jour"])
        return Response(RendezVousSerializer(rendez_vous).data)


class ProspectViewSet(viewsets.ModelViewSet):
    """CRUD complet réservé à l'administrateur, avec recherche.
    GET /api/prospects/?search=..."""

    queryset = Prospect.objects.all()
    serializer_class = ProspectSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = super().get_queryset()
        recherche = self.request.query_params.get("search")
        if recherche:
            qs = qs.filter(
                Q(prenom__icontains=recherche)
                | Q(nom__icontains=recherche)
                | Q(email__icontains=recherche)
                | Q(entreprise__icontains=recherche)
                | Q(telephone__icontains=recherche)
            )
        statut = self.request.query_params.get("statut")
        if statut:
            qs = qs.filter(statut=statut)
        return qs
