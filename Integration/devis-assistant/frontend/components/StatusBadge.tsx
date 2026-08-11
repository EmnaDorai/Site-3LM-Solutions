// StatusBadge.tsx
import { STATUT_CONFIG } from '@/lib/status';
interface StatusBadgeProps { statut: string; size?: 'sm' | 'md'; }
export default function StatusBadge({ statut, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUT_CONFIG[statut] ?? STATUT_CONFIG.brouillon;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass}`} style={{ background: cfg.bg ?? '#FFF1EC', color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}