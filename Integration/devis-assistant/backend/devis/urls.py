from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, DevisViewSet, PrestationViewSet, RendezVousViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='clients')
router.register(r'devis', DevisViewSet)
router.register(r'prestations', PrestationViewSet)
router.register(r'rendezvous', RendezVousViewSet, basename='rendezvous')

urlpatterns = router.urls