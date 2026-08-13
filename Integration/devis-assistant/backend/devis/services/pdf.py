from pathlib import Path

from django.template.loader import render_to_string
from django.conf import settings
from weasyprint import HTML

LOGO_PATH = Path(settings.BASE_DIR) / 'devis' / 'static' / 'devis' / 'logo_3lm.png'

COMPANY_INFO = {
    'nom': '3LM Solutions',
    'adresse': 'Ariana',
    'email': '3LMSolutions@gmail.com',
    'telephone': '',
}

STATUT_STYLE = {
    'brouillon': {'label': 'Brouillon', 'couleur': '#64748B', 'fond': '#F1F5F9'},
    'en_attente': {'label': 'En attente de validation', 'couleur': '#D97706', 'fond': '#FEF3C7'},
    'valide': {'label': 'Validé', 'couleur': '#059669', 'fond': '#D1FAE5'},
    'envoye': {'label': 'Envoyé au client', 'couleur': '#2563EB', 'fond': '#DBEAFE'},
    'refuse': {'label': 'Refusé', 'couleur': '#DC2626', 'fond': '#FEE2E2'},
}


def generer_pdf_devis(devis) -> bytes:
    style = STATUT_STYLE.get(devis.statut, STATUT_STYLE['brouillon'])
    html = render_to_string('devis/devis_pdf.html', {
        'devis': devis,
        'logo_path': LOGO_PATH.as_uri(),
        'company': COMPANY_INFO,
        'statut_label': style['label'],
        'statut_couleur': style['couleur'],
        'statut_fond': style['fond'],
    })

    return HTML(string=html, base_url=str(settings.BASE_DIR)).write_pdf()
