from django.urls import include, path
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter

from .views import CreneauxDisponiblesView, ProspectViewSet, RendezVousViewSet

router = DefaultRouter()
router.register(r"rendez-vous", RendezVousViewSet, basename="rendezvous")
router.register(r"prospects", ProspectViewSet, basename="prospect")
router.register(
    r"creneaux-disponibles", CreneauxDisponiblesView, basename="creneaux-disponibles"
)

urlpatterns = [
    path("", include(router.urls)),
    # POST { "username": "...", "password": "..." } -> { "token": "..." }
    path("auth/token/", obtain_auth_token, name="api-token-auth"),
]
