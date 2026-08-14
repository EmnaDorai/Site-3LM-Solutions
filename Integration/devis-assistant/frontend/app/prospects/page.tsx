'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchClients, updateClientStatut, deleteClient } from '@/lib/clients';
import { Client, StatutClient } from '@/lib/types';
import { STATUT_CLIENT_CONFIG } from '@/lib/statusClient';
import PageHeader from '@/components/PageHeader';
import { useToast } from '@/components/ToastProvider';

const STATUT_FILTERS = ['tous', ...Object.keys(STATUT_CLIENT_CONFIG)] as const;

export default function ProspectsPage() {
  const toast = useToast();
  const [list, setList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('tous');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchClients()
      .then(setList)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return list.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.nom.toLowerCase().includes(q) ||
        c.prenom?.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.entreprise?.toLowerCase().includes(q);
      const matchStatut = statutFilter === 'tous' || c.statut === statutFilter;
      return matchSearch && matchStatut;
    });
  }, [list, search, statutFilter]);

  const stats = useMemo(() => {
    const nouveau = list.filter((c) => c.statut === 'nouveau').length;
    const qualifie = list.filter((c) => c.statut === 'qualifie').length;
    const client = list.filter((c) => c.statut === 'client').length;
    return { total: list.length, nouveau, qualifie, client };
  }, [list]);

  const handleStatutChange = async (id: number, statut: StatutClient) => {
    setUpdatingId(id);
    try {
      const updated = await updateClientStatut(id, statut);
      setList((l) => l.map((c) => (c.id === id ? updated : c)));
      toast.success('Statut mis à jour.');
    } catch {
      toast.error('Impossible de mettre à jour le statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (!window.confirm(`Supprimer définitivement la fiche de ${nom} ?`)) return;
    setDeletingId(id);
    try {
      await deleteClient(id);
      setList((l) => l.filter((c) => c.id !== id));
      toast.success('Prospect supprimé.');
    } catch {
      toast.error('Impossible de supprimer ce prospect.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-8 py-10 max-w-5xl">
      <PageHeader eyebrow="Ligne directe" title="Prospects" />

      {!loading && list.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, from: 'var(--accent-secondary)', to: 'var(--accent-primary)' },
            { label: 'Nouveaux', value: stats.nouveau, from: 'var(--accent-amber)', to: 'var(--accent-primary)' },
            { label: 'Qualifiés', value: stats.qualifie, from: 'var(--accent-primary)', to: 'var(--accent-secondary)' },
            { label: 'Clients', value: stats.client, from: 'var(--accent-sage)', to: 'var(--accent-secondary)' },
          ].map((s) => (
            <div key={s.label} className="card-hover relative overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--line)] px-5 py-4">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundImage: `linear-gradient(90deg, ${s.from}, ${s.to})` }} />
              <p className="font-mono-num text-[11px] uppercase tracking-wider text-[var(--ink-soft)]">{s.label}</p>
              <p className="font-display text-3xl font-semibold mt-1 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
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
            placeholder="Rechercher un nom, une entreprise, un email..."
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
                  {s === 'tous' ? 'Tous' : STATUT_CLIENT_CONFIG[s]?.label ?? s}
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
          <p className="text-[var(--ink-soft)] text-sm">
            Aucun prospect pour l&apos;instant — ils apparaîtront ici dès qu&apos;un visiteur remplira le{' '}
            <a href="/rendez-vous" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent-secondary)' }}>
              formulaire public
            </a>{' '}
            ou qu&apos;un devis sera créé.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--ink-soft)]">Aucun résultat pour cette recherche.</p>
      ) : (
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden">
          <div className="grid grid-cols-[1fr_180px_160px_36px] px-5 py-3 text-[11px] uppercase tracking-wider text-[var(--ink-soft)] border-b border-[var(--line)] font-mono-num">
            <span>Contact</span>
            <span>Coordonnées</span>
            <span>Statut</span>
            <span />
          </div>
          {filtered.map((c, i) => (
            <div
              key={c.id}
              className="row-in grid grid-cols-[1fr_180px_160px_36px] px-5 py-4 items-center border-b border-[var(--line)] last:border-0 transition-colors hover:bg-[rgba(108,92,231,0.04)]"
              style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}
            >
              <div className="min-w-0 pr-4 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                  style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
                >
                  {(c.prenom?.[0] ?? c.nom[0] ?? '?').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <Link href={`/clients/${c.id}`} className="font-medium text-sm block truncate hover:text-[var(--accent-secondary)] transition-colors">
                    {c.prenom} {c.nom}
                  </Link>
                  {c.entreprise && <span className="text-[11px] text-[var(--ink-soft)]">{c.entreprise}</span>}
                </div>
              </div>
              <div className="text-xs text-[var(--ink-soft)] min-w-0">
                <p className="truncate">{c.email}</p>
                <p className="font-mono-num">{c.telephone}</p>
              </div>
              <select
                value={c.statut ?? 'nouveau'}
                disabled={updatingId === c.id}
                onChange={(e) => handleStatutChange(c.id, e.target.value as StatutClient)}
                className="text-xs font-semibold rounded-full px-3 py-1.5 outline-none border-0 cursor-pointer w-fit"
                style={{
                  background: STATUT_CLIENT_CONFIG[c.statut ?? 'nouveau']?.bg,
                  color: STATUT_CLIENT_CONFIG[c.statut ?? 'nouveau']?.color,
                }}
              >
                {Object.entries(STATUT_CLIENT_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleDelete(c.id, c.nom)}
                disabled={deletingId === c.id}
                title="Supprimer ce prospect"
                className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:text-white hover:bg-[var(--accent-brick)] transition-colors disabled:opacity-40 justify-self-end"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16zM10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
