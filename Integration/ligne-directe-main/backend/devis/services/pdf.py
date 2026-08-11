import base64
from pathlib import Path
from io import BytesIO

from django.template.loader import render_to_string
from django.conf import settings
from xhtml2pdf import pisa

LOGO_PATH = Path(settings.BASE_DIR) / 'devis' / 'static' / 'devis' / 'logo_3lm.png'

COMPANY_INFO = {
    'nom': '3LM Solutions',
    'adresse': 'Ariana',
    'email': '3LMSolutions@gmail.com',
    'telephone': '',
}


def _logo_base64() -> str:
    with open(LOGO_PATH, 'rb') as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')
    return f'data:image/png;base64,{encoded}'


def generer_pdf_devis(devis) -> bytes:
    html = render_to_string('devis/devis_pdf.html', {
        'devis': devis,
        'logo_data': _logo_base64(),
        'company': COMPANY_INFO,
    })

    buffer = BytesIO()
    resultat = pisa.CreatePDF(html, dest=buffer)

    if resultat.err:
        raise ValueError("Erreur lors de la génération du PDF")

    return buffer.getvalue()
