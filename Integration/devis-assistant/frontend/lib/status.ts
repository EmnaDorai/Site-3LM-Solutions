export const STATUT_CONFIG: Record<
  string,
  { label: string; color: string; border: string; bg: string }
> = {
  brouillon: { label: "Brouillon", color: "var(--ink-soft)", border: "var(--line)", bg: "#F1F1F3" },
  en_attente: { label: "En attente", color: "var(--accent-amber)", border: "var(--accent-amber)", bg: "#FFF7E6" },
  valide: { label: "Validé", color: "var(--accent-sage)", border: "var(--accent-sage)", bg: "#E9F9EF" },
  envoye: { label: "Envoyé", color: "var(--ink)", border: "var(--ink)", bg: "#EEF0F5" },
  refuse: { label: "Refusé", color: "var(--accent-brick)", border: "var(--accent-brick)", bg: "#FDECEC" },
};