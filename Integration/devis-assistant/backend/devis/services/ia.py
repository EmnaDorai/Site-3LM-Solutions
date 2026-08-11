import json
import os
import re
import random
from difflib import SequenceMatcher

import google.generativeai as genai

from ..models import Prestation

BUDGET_PATTERN = re.compile(r"budget[^\d]{0,15}(\d[\d\s]{1,7})", re.IGNORECASE)


def _extraire_budget(besoins_client: str):
    """Cherche un montant mentionné après le mot 'budget' dans le texte du manager."""
    match = BUDGET_PATTERN.search(besoins_client)
    if not match:
        return None
    montant_str = match.group(1).replace(" ", "")
    try:
        return float(montant_str)
    except ValueError:
        return None


def _lister_catalogue() -> str:
    """Formate le catalogue de prestations actives pour l'insérer dans le prompt."""
    prestations = Prestation.objects.filter(actif=True).order_by('categorie', 'nom')
    if not prestations:
        return "Aucune prestation cataloguée pour l'instant."

    lignes = []
    for p in prestations:
        lignes.append(f"- id={p.id} | {p.nom} | {p.get_categorie_display()} | prix de référence : {p.prix_reference} TND")
    return "\n".join(lignes)

def _rattacher_prestations(lignes: list) -> list:
    """Si l'IA n'a pas relié une ligne au catalogue, cherche une prestation
    dont le nom ressemble fortement à la description générée, et la relie."""
    prestations = list(Prestation.objects.filter(actif=True))

    for ligne in lignes:
        if ligne.get('prestation_id'):
            continue  # déjà reliée par l'IA, on ne touche pas

        description = (ligne.get('description') or '').lower()
        meilleur_score = 0.0
        meilleure_prestation = None

        for prestation in prestations:
            nom = prestation.nom.lower()
            score = SequenceMatcher(None, nom, description).ratio()
            # bonus si le nom de la prestation apparaît comme sous-chaîne
            if nom in description or description in nom:
                score += 0.3
            if score > meilleur_score:
                meilleur_score = score
                meilleure_prestation = prestation

        if meilleure_prestation and meilleur_score >= 0.45:
            ligne['prestation_id'] = meilleure_prestation.id

    return lignes

def _generer_mock(besoins_client: str, client_nom: str = "") -> dict:
    """Simule une réponse IA réaliste, ancrée sur le budget mentionné si présent."""
    budget_detecte = _extraire_budget(besoins_client)
    montant_total = budget_detecte or random.randint(800, 3000)

    repartition = [0.65, 0.20, 0.15]
    descriptions = [
        "Développement / mise en œuvre",
        "Configuration et tests",
        "Formation / accompagnement",
    ]

    lignes = []
    for description, part in zip(descriptions, repartition):
        prix = round(montant_total * part, -1) or 10
        lignes.append({"description": description, "quantite": 1, "prix_unitaire": prix})

    estimation = sum(l["prix_unitaire"] for l in lignes)

    return {
        "synthese": (
            f"Le client {client_nom or 'concerné'} souhaite une prestation détaillée "
            f"selon les besoins exprimés : {besoins_client[:150]}... "
            "Cette synthèse est générée en mode simulation (pas d'appel à l'IA réelle)."
        ),
        "estimation_montant": estimation,
        "lignes": lignes,
    }


def generer_devis_ia(besoins_client: str, client_nom: str = "") -> dict:
    use_mock = os.getenv("USE_MOCK_IA", "false").lower() == "true"

    if use_mock:
        return _generer_mock(besoins_client, client_nom)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "Clé Gemini non configurée. Définissez GEMINI_API_KEY dans backend/.env"
        )

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-3.5-flash")

    catalogue = _lister_catalogue()

    prompt = f"""Tu es un assistant commercial expert en rédaction de devis B2B pour une entreprise basée en Tunisie.
Analyse les besoins du client et produis un devis structuré en JSON STRICT (aucun texte avant/après, pas de balises markdown).

Client : {client_nom or "Non précisé"}
Besoins exprimés :
{besoins_client}

Voici le catalogue de prestations disponibles dans l'entreprise (utilise ces prix de référence en priorité) :
{catalogue}

Format JSON attendu exactement :
{{
  "synthese": "Résumé clair et professionnel du projet (3-5 phrases)",
  "estimation_montant": 1500.00,
  "lignes": [
    {{"prestation_id": 3, "description": "Nom de la prestation du catalogue", "quantite": 1, "prix_unitaire": 800.00}},
    {{"prestation_id": null, "description": "Prestation sur-mesure non cataloguée", "quantite": 1, "prix_unitaire": 300.00}}
  ]
}}

Règles :
- Priorité absolue : si un besoin correspond à une prestation du catalogue, utilise son "id" exact dans "prestation_id" et son prix de référence (tu peux ajuster légèrement selon la quantité, mais reste proche du prix catalogue)
- Si un besoin ne correspond à AUCUNE prestation du catalogue, crée une ligne sur-mesure avec "prestation_id": null
- Tous les montants sont exprimés en dinars tunisiens (TND), jamais en euros ou dollars
- Si un budget est mentionné explicitement dans les besoins exprimés, ajuste les quantités/lignes pour t'en rapprocher (écart maximum de 10%), sans casser les prix de référence du catalogue
- Au minimum 2 lignes de devis, maximum 8
- La somme exacte des lignes doit être égale à estimation_montant
- Rédige en français professionnel"""

    response = model.generate_content(prompt)
    texte = response.text.strip()

    if texte.startswith("```"):
        texte = texte.strip("`")
        if texte.startswith("json"):
            texte = texte[4:]
        texte = texte.strip()

    result = json.loads(texte)
    result['lignes'] = _rattacher_prestations(result.get('lignes', []))
    return result

    