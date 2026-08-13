'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  fetchRendezVousList,
  deleteRendezVous,
  confirmerRendezVous,
  annulerRendezVous,
  terminerRendezVous,
} from '@/lib/rendezvous';
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

interface RowProps {
  rdv: RendezVous;
  busy: boolean;
  onConfirmer: (id: number) => void;
  onAnnuler: (id: number) => void;
  onTerminer: (id: number) => void;
  onDelete: (id: number, nom?: string) => void;
}

function RendezVousRow({ rdv, busy, onConfirmer, onAnnuler, onTerminer, onDelete }: RowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-[var(--line)] last:border-0">
      <Link href={`/rendezvous/${rdv.id}`} className="flex-1 min-w-0 flex items-center gap-4 group">
        <div className="min-w-0 w-40 shrink-0">
          <span className="font-medium text-sm block truncate group-hover:text-[var(--accent-secondary)] transition-colors">
            {rdv.client_nom}
          </span>
          {rdv.client_entreprise && <span className="text-[11px] text-[var(--ink-soft)] block truncate">{rdv.client_entreprise}</span>}
        </div>
        <span className="text-xs text-[var(--ink-soft)] w-28 shrink-0">
          {TYPE_RDV_CONFIG[rdv.type_rdv]?.icon} {TYPE_RDV_CONFIG[rdv.type_rdv]?.label ?? rdv.type_rdv}
        </span>
        <span className="font-mono-num text-xs text-[var(--ink-soft)] w-32 shrink-0">
          {new Date(rdv.date_rdv).toLocaleDateString('fr-FR')} · {rdv.heure_rdv?.slice(0, 5)}
        </span>
        <span className="text-xs font-mono-num w-16 shrink-0">
          {rdv.devis ? <span className="text-[var(--accent-secondary)] font-semibold">#{rdv.devis}</span> : <span className="text-[var(--ink-soft)]">—</span>}
        </span>
        <RdvStatusBadge statut={rdv.statut} size="sm" />
      </Link>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {rdv.statut === 'demande' && (
          <button
            type="button"
            onClick={() => onConfirmer(rdv.id)}
            disabled={busy}
            className="text-xs font-semibold rounded-full px-3.5 py-1.5 text-white transition-opacity disabled:opacity-40"
            style={{ background: 'var(--accent-sage)' }}
          >
            ✓ Confirmer
          </button>
        )}
        {rdv.statut === 'confirme' && (
          <button
            type="button"
            onClick={() => onTerminer(rdv.id)}
            disabled={busy}
            className="text-xs font-semibold rounded-full px-3.5 py-1.5 text-white transition-opacity disabled:opacity-40"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
          >
            Terminer
          </button>
        )}
        {(rdv.statut === 'demande' || rdv.statut === 'confirme') && (
          <button
            type="button"
            onClick={() => onAnnuler(rdv.id)}
            disabled={busy}
            className="text-xs font-semibold rounded-full px-3.5 py-1.5 border transition-opacity disabled:opacity-40"
            style={{ borderColor: 'var(--accent-brick)', color: 'var(--accent-brick)' }}
          >
            Annuler
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(rdv.id, rdv.client_nom)}
          disabled={busy}
          title="Supprimer ce rendez-vous"
          className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:text-white hover:bg-[var(--accent-brick)] transition-colors disabled:opacity-40"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16zM10 11v6M14 11v6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  hint: string;
  badgeColor: string;
  items: RendezVous[];
  busyId: number | null;
  onConfirmer: (id: number) => void;
  onAnnuler: (id: number) => void;
  onTerminer: (id: number) => void;
  onDelete: (id: number, nom?: string) => void;
}

function RendezVousSection({ title, hint, badgeColor, items, busyId, ...actions }: SectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: badgeColor }} />
        <h2 className="font-display text-lg">{title}</h2>
        <span className="text-xs text-[var(--ink-soft)] font-mono-num">({items.length})</span>
      </div>
      <p className="text-xs text-[var(--ink-soft)] mb-3">{hint}</p>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-center bg-[var(--surface)]">
          <p className="text-[var(--ink-soft)] text-sm">Aucun rendez-vous ici pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden">
          {items.map((rdv) => (
            <RendezVousRow key={rdv.id} rdv={rdv} busy={busyId === rdv.id} {...actions} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RendezVousListPage() {
  const [list, setList] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('tous');
  const [busyId, setBusyId] = useState<number | null>(null);

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

  const demandesClients = useMemo(() => filtered.filter((r) => r.source === 'public'), [filtered]);
  const propositionsEquipe = useMemo(() => filtered.filter((r) => r.source !== 'public'), [filtered]);

  const stats = useMemo(() => {
    const demandes = list.filter((r) => r.statut === 'demande').length;
    const confirmes = list.filter((r) => r.statut === 'confirme').length;
    return { total: list.length, demandes, confirmes };
  }, [list]);

  const handleConfirmer = async (id: number) => {
    setBusyId(id);
    try {
      const { rendezVous } = await confirmerRendezVous(id);
      setList((l) => l.map((r) => (r.id === id ? rendezVous : r)));
    } catch {
      alert('Impossible de confirmer ce rendez-vous.');
    } finally {
      setBusyId(null);
    }
  };

  const handleAnnuler = async (id: number) => {
    setBusyId(id);
    try {
      const updated = await annulerRendezVous(id);
      setList((l) => l.map((r) => (r.id === id ? updated : r)));
    } catch {
      alert('Impossible d’annuler ce rendez-vous.');
    } finally {
      setBusyId(null);
    }
  };

  const handleTerminer = async (id: number) => {
    setBusyId(id);
    try {
      const updated = await terminerRendezVous(id);
      setList((l) => l.map((r) => (r.id === id ? updated : r)));
    } catch {
      alert('Impossible de clôturer ce rendez-vous.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: number, nom?: string) => {
    if (!window.confirm(`Supprimer définitivement le rendez-vous avec ${nom ?? 'ce client'} ?`)) return;
    setBusyId(id);
    try {
      await deleteRendezVous(id);
      setList((l) => l.filter((r) => r.id !== id));
    } catch {
      alert('Impossible de supprimer ce rendez-vous.');
    } finally {
      setBusyId(null);
    }
  };

  const rowActions = { onConfirmer: handleConfirmer, onAnnuler: handleAnnuler, onTerminer: handleTerminer, onDelete: handleDelete };

  return (
    <div className="px-8 py-10 max-w-5xl">
      <PageHeader
        eyebrow="Ligne directe"
        title="Rendez-vous"
        action={
          <div className="flex items-center gap-3">
            <a
              href="/rendez-vous"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono-num text-[var(--ink-soft)] hover:text-[var(--accent-secondary)] transition-colors underline underline-offset-2"
            >
              Voir le formulaire public ↗
            </a>
            <Link
              href="/rendezvous/nouveau"
              className="text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
            >
              <span className="text-lg leading-none">+</span>
              Proposer un rendez-vous
            </Link>
          </div>
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
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
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
        <>
          <RendezVousSection
            title="Demandes des clients"
            hint="Reçues via le formulaire public du site — à confirmer après vérification du créneau."
            badgeColor="var(--accent-secondary)"
            items={demandesClients}
            busyId={busyId}
            {...rowActions}
          />
          <RendezVousSection
            title="Propositions de l'équipe"
            hint="Créneaux proposés par un commercial (suite à un appel ou après l'envoi d'un devis)."
            badgeColor="var(--ink-soft)"
            items={propositionsEquipe}
            busyId={busyId}
            {...rowActions}
          />
        </>
      )}
    </div>
  );
}
