# Ligne Directe — Module de prise de rendez-vous

Implémentation conforme au Cahier des Charges N°2 : Next.js (frontend),
Django REST Framework (backend), PostgreSQL (base de données), envoi
d'emails réel, gestion des prospects, tableau de bord des rendez-vous.

```
project/
├── backend/     Django + DRF + PostgreSQL + envoi d'emails
└── frontend/    Next.js (visiteur + administrateur)
```

## 1. Backend (Django + PostgreSQL)

### 1.1 Créer la base PostgreSQL
```bash
psql -U postgres
CREATE DATABASE prise_rdv;
```

### 1.2 Installer et configurer
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# éditer .env : DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
# éditer .env : EMAIL_HOST, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD (voir §3)
```

### 1.3 Migrer et créer un compte administrateur
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 1.4 Lancer le serveur
```bash
python manage.py runserver
# API disponible sur http://localhost:8000/api/
```

Si PostgreSQL n'est pas encore installé et que vous voulez juste tester
rapidement, un mode de secours SQLite est fourni (ne pas utiliser en prod) :
```bash
python manage.py migrate --settings=core.settings_sqlite_dev
python manage.py runserver --settings=core.settings_sqlite_dev
```

### 1.5 Endpoints de l'API

| Méthode | URL                                    | Accès       | Description |
|---------|-----------------------------------------|-------------|--------------|
| POST    | `/api/rendez-vous/`                     | public      | Créer un prospect + son rendez-vous, envoie l'email |
| GET     | `/api/rendez-vous/?search=&statut=&date=`| admin      | Liste + recherche/filtre |
| PATCH   | `/api/rendez-vous/{id}/`                | admin       | Modifier date / heure / statut |
| DELETE  | `/api/rendez-vous/{id}/`                | admin       | Supprimer |
| POST    | `/api/rendez-vous/{id}/confirmer/`      | admin       | Confirmer en un clic |
| GET     | `/api/prospects/?search=&statut=`       | admin       | Gestion des prospects (CRUD) |
| GET     | `/api/creneaux-disponibles/?date=`      | public      | Créneaux déjà pris pour une date |
| POST    | `/api/auth/token/`                      | public      | Connexion admin → `{ "token": "..." }` |

L'authentification admin utilise un **Token DRF** : le frontend envoie
`Authorization: Token <token>` sur chaque appel protégé.

Une interface d'administration Django native est aussi disponible sur
`/admin/` (utile pour une gestion manuelle rapide, en plus de l'API).

## 2. Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.local.example .env.local
# éditer .env.local si l'API n'est pas sur localhost:8000
npm run dev
# Site disponible sur http://localhost:3000
```

- `/` — accueil, choix Visiteur / Administrateur
- `/rendez-vous` — formulaire public de prise de rendez-vous (relié à l'API)
- `/admin/login` — connexion administrateur (token DRF)
- `/admin` — tableau de bord : liste, recherche, modification, suppression,
  confirmation des rendez-vous

## 3. Envoi RÉEL d'emails

Le backend utilise `django.core.mail.send_mail`, donc n'importe quel
fournisseur SMTP standard fonctionne. Dans `.env` :

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=votre.compte@gmail.com
EMAIL_HOST_PASSWORD=xxxxxxxxxxxxxxxx   # mot de passe d'application Google
EMAIL_USE_TLS=True
```

Si `EMAIL_HOST` est laissé vide, les emails s'affichent simplement dans la
console du serveur (pratique en développement, aucun envoi réel).

Ce mécanisme a été testé de bout en bout pendant le développement :
création d'un rendez-vous → prospect enregistré en base → email de
confirmation généré automatiquement.

## 4. Ce qui a été vérifié pendant le développement

- `python manage.py check` : aucune erreur de configuration
- Migrations générées et appliquées avec succès
- Création d'un rendez-vous via l'API → prospect + rendez-vous bien
  enregistrés, email de confirmation envoyé (`email_confirmation_envoye: true`)
- Connexion admin par token, recherche (`?search=`), confirmation,
  modification (`PATCH`), suppression (`DELETE`), et refus d'accès (401)
  sans authentification — tous testés avec succès
- `npm run build` du frontend Next.js : compilation réussie, 6 pages générées

## 5. Prochaines étapes possibles

- Déploiement (Docker, Gunicorn + Nginx pour le backend, Vercel ou Node
  pour le frontend)
- Envoi d'un rappel automatique la veille du rendez-vous (tâche planifiée /
  Celery)
- Gestion fine des créneaux du commercial (disponibilités récurrentes)
- Rôles multiples (plusieurs commerciaux, plusieurs agendas)
