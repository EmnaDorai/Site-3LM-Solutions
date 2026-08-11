// LigneDirectePanel.tsx — intégration Ligne directe dans la page devis
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchRendezVousList } from '@/lib/rendezvous';
import { RendezVous } from '@/lib/types';
import { TYPE_RDV_CONFIG } from '@/lib/statusRdv';
import RdvStatusBadge from '@/components/RdvStatusBadge';

interface LigneDirectePanelProps {
  devisId: number;
  clientId: number;
}

export default function LigneDirectePanel({ devisId, clientId }: LigneDirectePanelProps) {
  const [rendezVous, setRendezVous] = useState<RendezVous[] | null>(null);

  useEffect(() => {
    let active = true;
    fetchRendezVousList({ devis: devisId })
      .then((list) => { if (active) setRendezVous(list); })
      .catch(() => { if (active) setRendezVous([]); });
    return () => { active = false; };
  }, [devisId]);

  if (rendezVous === null) {
    return (
      <div className="px-8 py-3 border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="h-8 w-64 rounded-full bg-[var(--line)]/50 animate-pulse" />
      </div>
    );
  }

  const dernier = rendezVous[0];

  return (
    <div className="px-8 py-3.5 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent-secondary)' }}>
          Ligne directe
        </span>

        {dernier ? (
          <Link href={`/rendezvous/${dernier.id}`} className="flex items-center gap-2 text-sm hover:underline">
            <span>{TYPE_RDV_CONFIG[dernier.type_rdv]?.icon}</span>
            <span className="font-medium">
              {new Date(dernier.date_rdv).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · {dernier.heure_rdv?.slice(0, 5)}
            </span>
            <RdvStatusBadge statut={dernier.statut} size="sm" />
          </Link>
        ) : (
          <span className="text-sm text-[var(--ink-soft)]">Aucun rendez-vous programmé pour ce devis.</span>
        )}
      </div>

      <Link
        href={`/rendezvous/nouveau?client=${clientId}&devis=${devisId}`}
        className="text-xs font-semibold rounded-full px-4 py-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-white shrink-0"
        style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
      >
        {dernier ? 'Nouveau rendez-vous' : 'Proposer un rendez-vous'}
      </Link>
    </div>
  );
}
