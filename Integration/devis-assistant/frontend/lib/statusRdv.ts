export const STATUT_RDV_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  demande: { label: 'Demandé', color: 'var(--accent-amber)', bg: '#FFF7E6' },
  confirme: { label: 'Confirmé', color: 'var(--accent-sage)', bg: '#E9F9EF' },
  annule: { label: 'Annulé', color: 'var(--accent-brick)', bg: '#FDECEC' },
  termine: { label: 'Terminé', color: 'var(--ink-soft)', bg: '#F1F1F3' },
};

export const TYPE_RDV_CONFIG: Record<string, { label: string; icon: string }> = {
  appel: { label: 'Appel téléphonique', icon: '📞' },
  visio: { label: 'Visioconférence', icon: '🖥️' },
  sur_site: { label: 'Sur site', icon: '📍' },
};
