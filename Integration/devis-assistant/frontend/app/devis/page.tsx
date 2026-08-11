'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Devis } from '@/lib/types';
import { STATUT_CONFIG } from '@/lib/status';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatMontant } from '@/lib/devis';

const STATUT_FILTERS = ['tous', ...Object.keys(STATUT_CONFIG)] as const;

const STAT_ACCENTS = [
  { from: 'var(--accent-primary)', to: 'var(--accent-secondary)' },
  { from: 'var(--accent-warm)', to: 'var(--accent-primary)' },
  { from: 'var(--accent-secondary)', to: 'var(--accent-sage)' },
];

export default function DevisListPage() {
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('tous');

  useEffect(() => {
    api
      .get('/devis/')
      .then((res) => setDevisList(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return devisList.filter((d) => {
      const matchSearch =
        !search ||
        d.client_nom?.toLowerCase().includes(search.toLowerCase()) ||
        d.besoins_client.toLowerCase().includes(search.toLowerCase());
      const matchStatut = statutFilter === 'tous' || d.statut === statutFilter;
      return matchSearch && matchStatut;
    });
  }, [devisList, search, statutFilter]);

  const stats = useMemo(() => {
    const brouillons = devisList.filter((d) => d.statut === 'brouillon').length;
    const valides = devisList.filter((d) => d.statut === 'valide').length;
    return { total: devisList.length, brouillons, valides };
  }, [devisList]);

  return (
    <div className="px-8 py-10 max-w-5xl">
      <PageHeader
        eyebrow="Registre"
        title="Devis"
        action={
          <Link
            href="/devis/nouveau"
            className="text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', boxShadow: 'var(--shadow-glow)' }}
          >
            <span className="text-lg leading-none">+</span>
            Nouveau devis
          </Link>
        }
      />

      {!loading && devisList.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Brouillons', value: stats.brouillons },
            { label: 'Validés', value: stats.valides },
          ].map((s, i) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--line)] px-5 py-4"
            >
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundImage: `linear-gradient(90deg, ${STAT_ACCENTS[i].from}, ${STAT_ACCENTS[i].to})` }}
              />
              <p className="font-mono-num text-[11px] uppercase tracking-wider text-[var(--ink-soft)]">
                {s.label}
              </p>
              <p
                className="font-display text-3xl font-semibold mt-1 bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${STAT_ACCENTS[i].from}, ${STAT_ACCENTS[i].to})` }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && devisList.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client ou des besoins..."
            className="flex-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
          <div className="flex flex-wrap gap-2">
            {STATUT_FILTERS.map((s) => {
              const active = statutFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatutFilter(s)}
                  className="text-xs uppercase tracking-wider font-mono-num px-3 py-2 rounded-full border transition-all duration-200"
                  style={
                    active
                      ? {
                          backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                          color: '#fff',
                          borderColor: 'transparent',
                        }
                      : { borderColor: 'var(--line)' }
                  }
                >
                  {s === 'tous' ? 'Tous' : STATUT_CONFIG[s]?.label ?? s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[var(--line)]/50 animate-pulse" />
          ))}
        </div>
      ) : devisList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] p-12 text-center bg-[var(--surface)]">
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <p className="text-[var(--ink-soft)] text-sm mb-4">Aucun devis pour l&apos;instant.</p>
          <Link
            href="/devis/nouveau"
            className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
          >
            Créer le premier devis
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--ink-soft)]">Aucun résultat pour cette recherche.</p>
      ) : (
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_120px_100px] px-5 py-3 text-[11px] uppercase tracking-wider text-[var(--ink-soft)] border-b border-[var(--line)] font-mono-num">
            <span>Client</span>
            <span>Statut</span>
            <span className="text-right">Estimation</span>
            <span>Date</span>
          </div>
          {filtered.map((devis) => (
            <Link
              key={devis.id}
              href={`/devis/${devis.id}`}
              className="grid grid-cols-[1fr_120px_120px_100px] px-5 py-4 items-center border-b border-[var(--line)] last:border-0 transition-colors group"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(108,92,231,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="min-w-0 pr-4">
                <span className="font-medium text-sm block truncate">{devis.client_nom}</span>
                {!devis.synthese_ia && (
                  <span className="text-[11px] text-[var(--accent-amber)] font-mono-num">
                    · à générer
                  </span>
                )}
              </div>
              <StatusBadge statut={devis.statut} size="sm" />
              <span className="text-right font-mono-num text-sm">
                {formatMontant(devis.estimation_montant)}
              </span>
              <span className="font-mono-num text-xs text-[var(--ink-soft)] group-hover:text-[var(--accent-primary)] transition-colors">
                {new Date(devis.date_creation).toLocaleDateString('fr-FR')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}