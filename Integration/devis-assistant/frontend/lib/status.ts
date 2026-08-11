export const STATUT_CONFIG: Record<
  string,
  { label: string; color: string; border: string }
> = {
  brouillon: { label: "Brouillon", color: "var(--ink-soft)", border: "var(--line)" },
  en_attente: { label: "En attente", color: "var(--accent-amber)", border: "var(--accent-amber)" },
  valide: { label: "Validé", color: "var(--accent-sage)", border: "var(--accent-sage)" },
  envoye: { label: "Envoyé", color: "var(--ink)", border: "var(--ink)" },
  refuse: { label: "Refusé", color: "var(--accent-brick)", border: "var(--accent-brick)" },
};