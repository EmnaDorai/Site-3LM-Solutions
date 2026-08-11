# Intégration Ligne Directe ↔ Assistant Devis

Documentation de l'intégration entre le module **Assistant devis (IA)** et le module **Ligne directe** (prise de rendez-vous), ajoutée au projet 3LM Solutions.

## Objectif

Permettre à un manager, directement depuis la fiche d'un devis, de proposer et suivre un rendez-vous de suivi avec le client (appel téléphonique, visioconférence ou rendez-vous sur site) — sans quitter le contexte du devis. Le module Ligne directe reste également utilisable de façon autonome, pour des rendez-vous non liés à un devis.

## Principe du lien

- Un `RendezVous` peut être créé **avec** ou **sans** `devis` associé (`devis` est une clé étrangère facultative, `null=True, blank=True`).
- Un `Devis` peut avoir **plusieurs** rendez-vous liés (`related_name='rendez_vous'`).
- La suppression d'un devis ne supprime pas ses rendez-vous : le champ `devis` passe simplement à `null` (`on_delete=models.SET_NULL`), l'historique du rendez-vous est conservé.

```
Client 1───N Devis 1───N RendezVous N───1 Client
                 (devis facultatif sur RendezVous)
```

## Ce qui a été ajouté

### Backend (`backend/devis/`)

| Fichier | Changement |
|---|---|
| `models.py` | Nouveau modèle `RendezVous` (client, devis optionnel, manager, date_rdv, heure_rdv, type_rdv, statut, notes) |
| `migrations/0003_rendezvous.py` | Migration créant la table `devis_rendezvous` |
| `serializers.py` | `RendezVousSerializer` (expose `client_nom`, `client_entreprise`, `client_telephone`, `client_email`, `devis_statut` en lecture seule) |
| `views.py` | `RendezVousViewSet` : filtrage par `?devis=`, `?client=`, `?statut=` ; actions `confirmer/`, `annuler/`, `terminer/` |
| `urls.py` | Route `router.register(r'rendezvous', RendezVousViewSet, basename='rendezvous')` |
| `admin.py` | `RendezVousAdmin` enregistré dans l'admin Django |
| `services/email.py` | `envoyer_confirmation_rdv(rendez_vous)` — envoie un email au client lors de la confirmation, mentionne le devis lié si présent |

### Frontend (`frontend/`)

| Fichier | Rôle |
|---|---|
| `components/LogoMark.tsx` | Logo 3LM Solutions en SVG |
| `components/Sidebar.tsx` | Ajout du logo + entrée de navigation « Ligne directe » |
| `components/RdvStatusBadge.tsx` | Badge de statut (demandé / confirmé / annulé / terminé) |
| `components/LigneDirectePanel.tsx` | **Point d'intégration principal** — bandeau affiché sur la page détail d'un devis |
| `lib/types.ts` | Types `RendezVous`, `TypeRdv`, `StatutRdv` |
| `lib/statusRdv.ts` | Config des libellés/couleurs de statut et type de rendez-vous |
| `lib/rendezvous.ts` | Appels API (`fetchRendezVousList`, `createRendezVous`, `confirmerRendezVous`, `annulerRendezVous`, `terminerRendezVous`) |
| `app/rendezvous/page.tsx` | Registre des rendez-vous (stats, recherche, filtre par statut) |
| `app/rendezvous/nouveau/page.tsx` | Création d'un rendez-vous, pré-rempli si lancé depuis un devis (`?client=&devis=`) |
| `app/rendezvous/[id]/page.tsx` | Détail d'un rendez-vous + actions confirmer/annuler/terminer |
| `app/devis/[id]/page.tsx` | Import et affichage de `<LigneDirectePanel devisId={devis.id} clientId={devis.client} />` sous l'en-tête |

## Comment ça s'active dans le parcours devis

1. Le manager ouvre un devis (`/devis/{id}`).
2. Sous l'en-tête, le composant `LigneDirectePanel` interroge `GET /api/rendezvous/?devis={id}` :
   - **Aucun rendez-vous trouvé** → un bouton « Proposer un rendez-vous » redirige vers `/rendezvous/nouveau?client={clientId}&devis={devisId}`, avec le client et le devis déjà pré-remplis.
   - **Rendez-vous existant** → affiche la date, l'heure, le type et le statut, avec un lien vers sa fiche détaillée.
3. Une fois le rendez-vous confirmé (`POST /api/rendezvous/{id}/confirmer/`), un email de confirmation part automatiquement vers le client, et le bandeau sur la page devis se met à jour au prochain chargement.

## Endpoints ajoutés

| Méthode | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/rendezvous/` | Liste / création — filtrable par `?devis=`, `?client=`, `?statut=` |
| GET/PATCH/DELETE | `/api/rendezvous/{id}/` | Détail / mise à jour / suppression |
| POST | `/api/rendezvous/{id}/confirmer/` | Passe le statut à `confirme` + envoie l'email de confirmation |
| POST | `/api/rendezvous/{id}/annuler/` | Passe le statut à `annule` |
| POST | `/api/rendezvous/{id}/terminer/` | Passe le statut à `termine` |

## Mise en place

```bash
# Backend
cd backend
venv\Scripts\activate
python manage.py migrate          # applique 0003_rendezvous
python manage.py runserver

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
```

Pré-requis : le conteneur PostgreSQL doit tourner (`docker compose up -d` depuis la racine du projet) avant de lancer le backend.

## Scénario de test end-to-end

1. Créer/ouvrir un devis pour un client ayant un email valide.
2. Sur `/devis/{id}`, cliquer sur « Proposer un rendez-vous » dans le bandeau Ligne directe.
3. Remplir date, heure, type de rendez-vous → valider.
4. Sur la fiche du rendez-vous créé, cliquer sur « Confirmer le rendez-vous ».
5. Vérifier :
   - le statut passe à **Confirmé** ;
   - un email de confirmation est reçu par le client (ou visible dans la console si `EMAIL_BACKEND` est en mode console) ;
   - en retournant sur `/devis/{id}`, le bandeau Ligne directe affiche désormais ce rendez-vous ;
   - le rendez-vous apparaît aussi dans le registre général `/rendezvous` avec un lien vers le devis (`#{id}`).

## Notes

- Le champ `devis` sur `RendezVous` est facultatif : le module reste utilisable de façon 100% indépendante depuis `/rendezvous/nouveau` (sans query params).
- L'envoi d'email de confirmation échoue silencieusement côté statut (le rendez-vous reste confirmé même si l'email ne part pas) — l'erreur est renvoyée dans la réponse API (`status: "rendez-vous confirmé mais email non envoyé"`) pour information au manager.
