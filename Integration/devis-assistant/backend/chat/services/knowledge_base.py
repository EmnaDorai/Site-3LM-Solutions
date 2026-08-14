from functools import lru_cache
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_BASE_PATH = BASE_DIR / "knowledge_base" / "3lm_solutions.md"


@lru_cache(maxsize=1)
def load_business_knowledge() -> str:
    return KNOWLEDGE_BASE_PATH.read_text(encoding="utf-8")
