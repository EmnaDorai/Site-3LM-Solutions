// RdvStatusBadge.tsx
import { STATUT_RDV_CONFIG } from '@/lib/statusRdv';

interface RdvStatusBadgeProps {
  statut: string;
  size?: 'sm' | 'md';
}

export default function RdvStatusBadge({ statut, size = 'md' }: RdvStatusBadgeProps) {
  const cfg = STATUT_RDV_CONFIG[statut] ?? STATUT_RDV_CONFIG.demande;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass}`} style={{ background: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}
