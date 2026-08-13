# Generated for Ligne Directe integration (Prospect fusionné dans Client + créneau public)

import django.db.models.deletion
from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):

    dependencies = [
        ('devis', '0003_rendezvous'),
    ]

    operations = [
        migrations.AddField(
            model_name='client',
            name='message',
            field=models.TextField(blank=True, help_text="Message initial laissé via le formulaire public"),
        ),
        migrations.AddField(
            model_name='client',
            name='statut',
            field=models.CharField(
                choices=[
                    ('nouveau', 'Nouveau prospect'),
                    ('contacte', 'Contacté'),
                    ('qualifie', 'Qualifié (devis en cours)'),
                    ('client', 'Client (devis envoyé)'),
                    ('perdu', 'Perdu'),
                ],
                default='nouveau',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='rendezvous',
            name='source',
            field=models.CharField(
                choices=[
                    ('interne', 'Proposé par le manager'),
                    ('public', 'Demandé par le visiteur (formulaire en ligne)'),
                ],
                default='interne',
                max_length=20,
            ),
        ),
        migrations.AddConstraint(
            model_name='rendezvous',
            constraint=models.UniqueConstraint(
                condition=Q(statut__in=['demande', 'confirme']),
                fields=('date_rdv', 'heure_rdv'),
                name='creneau_unique_actif',
            ),
        ),
    ]
