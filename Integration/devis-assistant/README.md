# 3LM Solutions — Assistant Devis IA & Ligne Directe

Application interne pour l'équipe commerciale de 3LM Solutions : génération de devis assistée par IA et prise de rendez-vous, réunies dans un seul projet Django + Next.js.

```
devis-assistant/
├── backend/     Django + DRF + PostgreSQL
└── frontend/    Next.js (App Router) + Tailwind
```

## 1. Scénario complet

Le module Ligne Directe fonctionne désormais en deux entrées, toutes les deux alimentant la même base de contacts (`Client`) et le même agenda (`RendezVous`) :

**A — Le visiteur prend rendez-vous seul, depuis le site public**
1. Un visiteur ouvre la page d'accueil (`/`) puis clique sur « Prendre rendez-vous » (`/rendez-vous`, sans connexion) et remplit le formulaire : prénom, nom, email, téléphone, entreprise, besoin, date et heure souhaitées.
2. Avant de choisir un créneau, le formulaire interroge `GET /api/rendezvous/creneaux/?date=` pour afficher les horaires déjà pris ce jour-là.
3. À l'envoi, `POST /api/rendezvous/public/` (ouvert, sans authentification) vérifie qu'aucun rendez-vous actif n'existe déjà sur ce créneau (double vérification : côté serveur *et* contrainte SQL `creneau_unique_actif`), puis crée — ou retrouve — le `Client` correspondant (statut `nouveau`) et un `RendezVous` (statut `demande`, source `public`).
4. Un email d'accusé de réception est envoyé automatiquement au visiteur.

**B — Le prospect appelle directement l'entreprise**
1. Un commercial reçoit l'appel, ouvre l'espace admin (après connexion, voir §3) et crée une fiche `Client` avec ses coordonnées et son besoin.
2. Le manager planifie lui-même un rendez-vous de qualification (`/rendezvous/nouveau`) — ce créneau passe par la même vérification anti-doublon.

**La suite est commune aux deux parcours :**

3. Le manager confirme le rendez-vous depuis le tableau de bord (`POST /api/rendezvous/{id}/confirmer/`) → le client reçoit un email de confirmation, et sa fiche passe de `nouveau` à `qualifié` dès qu'un devis est ouvert pour lui.
4. Pendant ou après l'échange, le manager crée un **devis** pour ce client (`/devis/nouveau`) avec ses besoins bruts.
5. Le manager clique sur « Générer avec l'IA » : Gemini synthétise le besoin, propose des lignes de prestation et une estimation chiffrée.
6. Le manager ajuste les lignes si besoin, puis **valide** le devis : le PDF personnalisé (logo, couleurs 3LM) est généré et envoyé par email au client. La fiche client passe alors au statut `client`.
7. Si un point reste à éclaircir, le manager propose un nouveau rendez-vous (visio, appel ou sur site), rattaché à ce devis — toujours soumis à la contrainte de créneau unique.
8. Le rendez-vous a lieu ; le manager le marque « Terminé » ou, en cas d'annulation, « Annulé ».

Ainsi, qu'un prospect arrive via le formulaire public ou par appel téléphonique, il suit le même pipeline : contact → rendez-vous → devis IA → validation/envoi → suivi.

## 2. Backend (Django + PostgreSQL)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux : source venv/bin/activate
pip install -r requirements.txt

# .env : DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
# .env : GEMINI_API_KEY (ou USE_MOCK_IA=true pour tester sans clé)
# .env : EMAIL_HOST, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD (Brevo, voir §5)

python manage.py migrate
python manage.py createsuperuser   # compte admin pour se connecter au frontend
python manage.py runserver
# API disponible sur http://127.0.0.1:8000/api/
```

### 2.1 Endpoints principaux

| Méthode | URL                                        | Accès   | Description |
|---------|----------------------------------------------|---------|--------------|
| POST    | `/api/auth/token/`                            | public  | Connexion admin → `{ "token": "..." }` |
| POST    | `/api/rendezvous/public/`                     | public  | Formulaire public : crée client + rendez-vous, envoie l'email |
| GET     | `/api/rendezvous/creneaux/?date=`             | public  | Créneaux déjà pris pour une date |
| GET/POST| `/api/clients/?search=&statut=`                | admin   | Gestion des prospects/clients (recherche, filtre statut) |
| GET/POST| `/api/devis/`                                 | admin   | Gestion des devis |
| POST    | `/api/devis/{id}/generer_ia/`                 | admin   | Génération IA (synthèse + lignes + estimation) |
| POST    | `/api/devis/{id}/valider/`                    | admin   | Valide, génère le PDF et l'envoie par email |
| GET     | `/api/devis/{id}/pdf/`                        | admin   | Télécharge le PDF (devis validé uniquement) |
| GET/POST| `/api/rendezvous/`                            | admin   | Liste / création interne (filtrable par `?devis=&client=&statut=`) |
| POST    | `/api/rendezvous/{id}/confirmer/`             | admin   | Confirme + email de confirmation |
| POST    | `/api/rendezvous/{id}/annuler/`               | admin   | Annule le rendez-vous |
| POST    | `/api/rendezvous/{id}/terminer/`              | admin   | Marque le rendez-vous comme terminé |

L'authentification admin utilise un **token DRF** (`Authorization: Token <token>`), obtenu via `/api/auth/token/`. Toutes les routes admin sont protégées (`IsAuthenticated`) ; seules `/api/rendezvous/public/` et `/api/rendezvous/creneaux/` restent ouvertes.

### 2.2 Anti-double réservation

Un `UniqueConstraint` en base (`creneau_unique_actif`) empêche deux rendez-vous actifs (`demande` ou `confirme`) de partager la même date/heure, quel que soit le client. La même règle est vérifiée côté serializer avant l'écriture, pour renvoyer un message clair plutôt qu'une erreur SQL brute.

## 3. Frontend (Next.js + Tailwind)

```bash
cd frontend
npm install
npm run dev
# Site public : http://localhost:3000/
# Espace admin : http://localhost:3000/login (puis redirection vers /devis)
```

- `/` — page d'accueil publique (vitrine 3LM Solutions), point d'entrée pour les visiteurs.
- `/rendez-vous` — formulaire public de prise de rendez-vous, accessible sans connexion.
- `/login` — connexion de l'équipe commerciale (token DRF stocké côté navigateur).
- `/devis`, `/devis/nouveau`, `/devis/{id}` — registre des devis et génération IA.
- `/rendezvous`, `/rendezvous/nouveau`, `/rendezvous/{id}` — agenda Ligne Directe ; les rendez-vous issus du formulaire public sont repérés par un badge « En ligne ».
- `/prospects` — gestion des prospects/clients : recherche, filtre par statut (nouveau, contacté, qualifié, client, perdu), changement de statut inline, suppression.

Toute page autre que `/reservation` et `/login` exige une session valide ; sans token, l'utilisateur est redirigé vers `/login`.

## 4. Génération IA des devis

La génération utilise l'API **Google Gemini** (modèle `gemini-3.5-flash`) via `google-generativeai`. Sans clé API valide, définir `USE_MOCK_IA=true` dans `.env` pour tester avec des données simulées. Si le quota Gemini est atteint, l'endpoint `generer_ia` renvoie une erreur 503/500 explicite plutôt que de planter silencieusement.

## 5. Envoi des emails (Brevo)

Tous les emails (proposition de rendez-vous, confirmation, accusé de réception public, devis PDF) passent par `django.core.mail`, configuré pour le SMTP **Brevo** :

```
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_HOST_USER=votre-compte-brevo
EMAIL_HOST_PASSWORD=votre-cle-smtp-brevo
EMAIL_USE_TLS=true
DEFAULT_FROM_EMAIL=contact@3lmsolutions.tn
```

Si `EMAIL_HOST` est laissé vide, `EmailBackend` console affiche les emails dans le terminal (pratique en développement). Chaque endpoint renvoie un indicateur de succès/échec d'envoi (`email_warning`, `email_envoye`) plutôt que d'échouer silencieusement.

## 6. PDF de devis

Généré avec **WeasyPrint** (rendu CSS complet, SVG natif) à partir d'un template HTML aux couleurs 3LM Solutions (bannière vague marine/rouge, logo, statut coloré). Pagination gérée via `@page` : la première page est pleine largeur (bannière en haut), les pages suivantes ont une marge de tête classique pour rester lisibles.
