'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchRendezVousList } from '@/lib/rendezvous';
import { RendezVous } from '@/lib/types';
import { STATUT_RDV_CONFIG, TYPE_RDV_CONFIG } from '@/lib/statusRdv';
import PageHeader from '@/components/PageHeader';
import RdvStatusBadge from '@/components/RdvStatusBadge';

const STATUT_FILTERS = ['tous', ...Object.keys(STATUT_RDV_CONFIG)] as const;

const STAT_ACCENTS = [
  { from: 'var(--accent-secondary)', to: 'var(--accent-primary)' },
  { from: 'var(--accent-amber)', to: 'var(--accent-primary)' },
  { from: 'var(--accent-sage)', to: 'var(--accent-secondary)' },
];

export default function RendezVousListPage() {
  const [list, setList] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('tous');

  useEffect(() => {
    fetchRendezVousList()
      .then(setList)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return list.filter((r) => {
      const matchSearch =
        !search ||
        r.client_nom?.toLowerCase().includes(search.toLowerCase()) ||
        r.client_entreprise?.toLowerCase().includes(search.toLowerCase());
      const matchStatut = statutFilter === 'tous' || r.statut === statutFilter;
      return matchSearch && matchStatut;
    });
  }, [list, search, statutFilter]);

  const stats = useMemo(() => {
    const demandes = list.filter((r) => r.statut === 'demande').length;
    const confirmes = list.filter((r) => r.statut === 'confirme').length;
    return { total: list.length, demandes, confirmes };
  }, [list]);

  return (
    <div className="px-8 py-10 max-w-5xl">
      <PageHeader
        eyebrow="Ligne directe"
        title="Rendez-vous"
        action={
          <Link
            href="/rendezvous/nouveau"
            className="text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
          >
            <span className="text-lg leading-none">+</span>
            Proposer un rendez-vous
          </Link>
        }
      />

      {!loading && list.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Demandés', value: stats.demandes },
            { label: 'Confirmés', value: stats.confirmes },
          ].map((s, i) => (
            <div key={s.label} className="relative overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--line)] px-5 py-4">
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundImage: `linear-gradient(90deg, ${STAT_ACCENTS[i].from}, ${STAT_ACCENTS[i].to})` }}
              />
              <p className="font-mono-num text-[11px] uppercase tracking-wider text-[var(--ink-soft)]">{s.label}</p>
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

      {!loading && list.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client ou une entreprise..."
            className="flex-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors"
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
                      ? { backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))', color: '#fff', borderColor: 'transparent' }
                      : { borderColor: 'var(--line)' }
                  }
                >
                  {s === 'tous' ? 'Tous' : STATUT_RDV_CONFIG[s]?.label ?? s}
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
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] p-12 text-center bg-[var(--surface)]">
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
            </svg>
          </div>
          <p className="text-[var(--ink-soft)] text-sm mb-4">Aucun rendez-vous pour l&apos;instant.</p>
          <Link
            href="/rendezvous/nouveau"
            className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
          >
            Proposer le premier rendez-vous
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--ink-soft)]">Aucun résultat pour cette recherche.</p>
      ) : (
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden">
          <div className="grid grid-cols-[1fr_140px_120px_100px_100px] px-5 py-3 text-[11px] uppercase tracking-wider text-[var(--ink-soft)] border-b border-[var(--line)] font-mono-num">
            <span>Client</span>
            <span>Type</span>
            <span>Statut</span>
            <span>Date</span>
            <span>Devis</span>
          </div>
          {filtered.map((rdv) => (
            <Link
              key={rdv.id}
              href={`/rendezvous/${rdv.id}`}
              className="grid grid-cols-[1fr_140px_120px_100px_100px] px-5 py-4 items-center border-b border-[var(--line)] last:border-0 transition-colors group"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(67,97,238,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="min-w-0 pr-4">
                <span className="font-medium text-sm block truncate">{rdv.client_nom}</span>
                {rdv.client_entreprise && (
                  <span className="text-[11px] text-[var(--ink-soft)]">{rdv.client_entreprise}</span>
                )}
              </div>
              <span className="text-xs text-[var(--ink-soft)]">
                {TYPE_RDV_CONFIG[rdv.type_rdv]?.icon} {TYPE_RDV_CONFIG[rdv.type_rdv]?.label ?? rdv.type_rdv}
              </span>
              <RdvStatusBadge statut={rdv.statut} size="sm" />
              <span className="font-mono-num text-xs text-[var(--ink-soft)] group-hover:text-[var(--accent-secondary)] transition-colors">
                {new Date(rdv.date_rdv).toLocaleDateString('fr-FR')} · {rdv.heure_rdv?.slice(0, 5)}
              </span>
              <span className="text-xs font-mono-num">
                {rdv.devis ? (
                  <span className="text-[var(--accent-secondary)] font-semibold">#{rdv.devis}</span>
                ) : (
                  <span className="text-[var(--ink-soft)]">—</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
