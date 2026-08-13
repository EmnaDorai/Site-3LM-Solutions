# Assistant IA de Génération de Devis & Ligne Directe — 3LM Solutions

Application interne développée dans le cadre d'un stage chez **3LM Solutions**. Elle couvre tout le parcours commercial : de l'appel client jusqu'au devis signé, en passant par la prise de rendez-vous de suivi.

## Fonctionnalités

### 1. Assistant devis (IA)
- Fiche client (nom, entreprise, email, téléphone)
- Saisie des besoins bruts du client (notes prises pendant l'appel)
- Génération automatique par IA (Gemini) d'une synthèse professionnelle, d'une estimation chiffrée et des lignes de devis, à partir du catalogue de prestations de l'entreprise
- Rattachement intelligent des lignes générées aux prestations du catalogue (prix de référence respectés)
- Régénération / affinage du devis via des instructions complémentaires (ex. « ajouter une ligne maintenance », « réduire le budget de 20% »)
- Modification manuelle des besoins avant validation
- Validation du devis → génération d'un PDF personnalisé et envoi automatique par email au client
- Téléchargement du PDF une fois le devis validé
- Registre des devis avec recherche, filtres par statut, et suppression directe depuis l'interface

### 2. Ligne directe (rendez-vous)
- Registre des rendez-vous (appel téléphonique, visioconférence, ou sur site), liés ou non à un devis
- Depuis la fiche d'un devis, un bandeau **Ligne directe** permet de proposer un rendez-vous en un clic (client et devis pré-remplis)
- Cycle de statut : `demandé` → `confirmé` → `terminé`, ou `annulé`
- Email de **proposition** automatique dès la création du rendez-vous (le client reçoit le créneau suggéré et est invité à confirmer sa disponibilité)
- Email de **confirmation** automatique lorsque le manager valide le rendez-vous dans l'interface
- Suppression directe depuis l'interface (registre ou fiche détail)

## Scénario métier (logique complète)

1. **Appel client** — le client appelle et décrit oralement ses besoins.
2. **Prise de notes** — le manager saisit ces besoins bruts dans « Nouveau devis » (texte libre, pas besoin de le structurer).
3. **Génération IA** — l'assistant produit automatiquement une synthèse, une estimation et des lignes de devis chiffrées, en s'appuyant sur le catalogue de prestations.
4. **Relecture / ajustement** — le manager affine si besoin (instructions complémentaires ou modification manuelle des besoins).
5. **Validation** — le devis est validé → un PDF personnalisé (logo, couleurs de l'entreprise) est généré et envoyé automatiquement par email au client : c'est le devis officiel.
6. **Proposition de rendez-vous** — pour clarifier un point ou négocier, le manager propose un rendez-vous de suivi via le bandeau **Ligne directe** sur la fiche du devis (appel, visio, ou sur site).
7. **Notification au client** — dès la création du rendez-vous (statut « demandé »), un email de proposition part automatiquement au client avec le créneau suggéré, en lui demandant de confirmer sa disponibilité (par téléphone ou en répondant à l'email) — l'outil n'ayant pas de portail client en libre-service, la confirmation se fait oralement ou par retour d'email.
8. **Confirmation** — une fois l'accord du client obtenu, le manager clique sur « Confirmer » dans l'interface → statut « confirmé » + email de confirmation officielle envoyé au client (trace écrite du rendez-vous).
9. **Suivi** — après l'échange, le manager marque le rendez-vous « Terminé ». En cas d'annulation ou d'absence de réponse, il passe à « Annulé ».
10. **Registre** — devis et rendez-vous restent consultables, filtrables, et supprimables à tout moment depuis les registres `/devis` et `/rendezvous`.

## Le PDF de devis

Le PDF est généré avec **WeasyPrint** (et non plus xhtml2pdf, abandonné pour un rendu CSS trop limité : pas de courbes, mauvaise gestion des coins arrondis et des images). Design :

- Bandeau plein largeur en dégradé de vague bleu marine / rouge (SVG vectoriel), avec le numéro du devis, un badge de statut coloré (brouillon / validé / envoyé...), le logo et le nom de 3LM Solutions
- Bloc adresses Client / Entreprise, synthèse IA en encart coloré
- Tableau des lignes à bordure arrondie rouge, catégories de prestations en puces colorées
- Sous-total / TVA / barre « Total » pleine largeur
- Bloc informations de paiement, conditions, et encadré Date/Signature
- Pagination propre : si le devis dépasse une page, un espace d'en-tête (2 cm) est réservé sur les pages suivantes, et le tableau des lignes peut se répartir sur plusieurs pages sans perte de données (l'en-tête du tableau se répète automatiquement)

### Installation de WeasyPrint (Windows)

```bash
cd backend
venv\Scripts\activate
pip install weasyprint
```

WeasyPrint dépend des librairies GTK (Pango/Cairo/GDK-PixBuf), absentes de Python sur Windows :

1. Téléchargez et installez le [GTK3 runtime pour Windows](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases) (`gtk3-runtime-*-win64.exe`), en cochant l'ajout au PATH.
2. Redémarrez le terminal (ou l'ordinateur si besoin).
3. Vérifiez : `python -c "import weasyprint; print('ok')"`.

## Stack technique

| Côté      | Technologies |
|-----------|--------------|
| Backend   | Django 5.2, Django REST Framework, PostgreSQL, Gemini API (`google-generativeai`), WeasyPrint (PDF), django-cors-headers |
| Frontend  | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Axios |
| Email     | SMTP (Brevo) ou backend console en développement |

## Structure du projet

```
devis-assistant/
├── docker-compose.yaml        # PostgreSQL en conteneur
├── backend/
│   ├── manage.py
│   ├── .env                   # variables d'environnement (non versionné)
│   ├── devis_project/         # settings, urls, wsgi
│   └── devis/                 # app Django principale
│       ├── models.py          # Client, Devis, Prestation, LigneDevis, RendezVous
│       ├── serializers.py
│       ├── views.py           # ViewSets DRF (devis, clients, prestations, rendezvous)
│       ├── urls.py
│       ├── admin.py
│       ├── templates/devis/devis_pdf.html   # template PDF (WeasyPrint)
│       └── services/
│           ├── ia.py          # génération du devis via Gemini
│           ├── pdf.py         # génération du PDF (WeasyPrint)
│           └── email.py       # envoi devis + proposition/confirmation RDV
└── frontend/
    ├── app/
    │   ├── devis/              # registre, création, détail du devis
    │   └── rendezvous/         # registre, création, détail des rendez-vous (Ligne directe)
    ├── components/             # Sidebar, LogoMark, AssistantPanel, DevisPreview, LigneDirectePanel, ...
    └── lib/                    # api.ts, types.ts, devis.ts, rendezvous.ts, status.ts, statusRdv.ts
```

## Installation

### 1. Base de données

```bash
docker compose up -d
```

### 2. Backend (Django)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux / macOS

pip install django djangorestframework django-cors-headers psycopg2-binary python-dotenv google-generativeai weasyprint
python manage.py migrate
python manage.py createsuperuser  # facultatif, pour /admin/
python manage.py runserver
```

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend sur `http://localhost:3000`, API sur `http://127.0.0.1:8000/api/`.

## Variables d'environnement (`backend/.env`)

```env
DB_NAME=devis_db
DB_USER=devis_user
DB_PASSWORD=devis_pass
DB_HOST=localhost
DB_PORT=5432

GEMINI_API_KEY=votre_cle_gemini
USE_MOCK_IA=false          # true = simule la génération IA sans appeler Gemini

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=votre_identifiant_smtp
EMAIL_HOST_PASSWORD=votre_mot_de_passe_smtp
DEFAULT_FROM_EMAIL=contact@3lmsolutions.tn
```

> En développement, `EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend` affiche les emails dans le terminal au lieu de les envoyer réellement.

## Principaux endpoints API

| Méthode | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/clients/` | Liste / création de clients |
| GET/POST | `/api/devis/` | Liste / création de devis |
| GET/PATCH/DELETE | `/api/devis/{id}/` | Détail / mise à jour / suppression |
| POST | `/api/devis/{id}/generer_ia/` | Génère la synthèse + lignes via l'IA |
| POST | `/api/devis/{id}/valider/` | Valide le devis, génère le PDF, l'envoie par email |
| GET | `/api/devis/{id}/pdf/` | Télécharge le PDF (devis validé uniquement) |
| GET/POST | `/api/prestations/` | Catalogue de prestations |
| GET/POST | `/api/rendezvous/` | Liste / création de rendez-vous (filtrable par `?devis=`, `?client=`, `?statut=`) |
| GET/PATCH/DELETE | `/api/rendezvous/{id}/` | Détail / mise à jour / suppression |
| POST | `/api/rendezvous/{id}/confirmer/` | Confirme le rendez-vous + email de confirmation |
| POST | `/api/rendezvous/{id}/annuler/` | Annule le rendez-vous |
| POST | `/api/rendezvous/{id}/terminer/` | Marque le rendez-vous comme terminé |

## Notes

- `USE_MOCK_IA=true` permet de tester le flux de bout en bout sans consommer de quota Gemini.
- `DEBUG=True` et `SECRET_KEY` en dur dans `settings.py` sont adaptés au développement uniquement — à sécuriser avant toute mise en production.
- Le module Ligne directe fonctionne aussi de façon 100% autonome (rendez-vous non lié à un devis), accessible via `/rendezvous/nouveau` sans paramètres.
