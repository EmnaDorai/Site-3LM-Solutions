"""Settings de confort pour tester le projet en local SANS PostgreSQL installé.

Usage :
    python manage.py runserver --settings=core.settings_sqlite_dev

Ce module reprend exactement la configuration de production (core.settings)
et remplace uniquement le moteur de base de données par SQLite, pour
permettre de vérifier rapidement que l'API et les emails fonctionnent avant
de brancher PostgreSQL. Ne pas utiliser en production.
"""

from .settings import *  # noqa: F401,F403

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db_dev.sqlite3",  # noqa: F405
    }
}
