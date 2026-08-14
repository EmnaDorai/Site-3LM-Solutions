'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchClient, updateClientStatut, deleteClient } from '@/lib/clients';
import { fetchDevisList, formatMontant } from '@/lib/devis';
import { fetchRendezVousList } from '@/lib/rendezvous';
import { Client, Devis, RendezVous, StatutClient } from '@/lib/types';
import { STATUT_CLIENT_CONFIG } from '@/lib/statusClient';
import { TYPE_RDV_CONFIG } from '@/lib/statusRdv';
import StatusBadge from '@/components/StatusBadge';
import RdvStatusBadge from '@/components/RdvStatusBadge';
import { useToast } from '@/components/ToastProvider';

type TimelineItem =
  | { kind: 'devis'; date: string; devis: Devis }
  | { kind: 'rdv'; date: string; rdv: RendezVous };

export default function ClientHistoriquePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [rdvList, setRdvList] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatut, setUpdatingStatut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, d, r] = await Promise.all([
        fetchClient(id),
        fetchDevisList({ client: id }),
        fetchRendezVousList({ client: id }),
      ]);
      setClient(c);
      setDevisList(d);
      setRdvList(r);
      setError(null);
    } catch {
      setError('Impossible de charger cette fiche client.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const timeline: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [
      ...devisList.map((devis) => ({ kind: 'devis' as const, date: devis.date_creation, devis })),
      ...rdvList.map((rdv) => ({ kind: 'rdv' as const, date: rdv.date_creation, rdv })),
    ];
    return items.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [devisList, rdvList]);

  const stats = useMemo(() => {
    const totalDevis = devisList.length;
    const devisValides = devisList.filter((d) => d.statut === 'valide' || d.statut === 'envoye').length;
    const totalRdv = rdvList.length;
    const montantTotal = devisList
      .filter((d) => d.statut === 'valide' || d.statut === 'envoye')
      .reduce((sum, d) => sum + (typeof d.estimation_montant === 'string' ? parseFloat(d.estimation_montant) : d.estimation_montant ?? 0), 0);
    return { totalDevis, devisValides, totalRdv, montantTotal };
  }, [devisList, rdvList]);

  const handleStatutChange = async (statut: StatutClient) => {
    if (!client) return;
    setUpdatingStatut(true);
    try {
      const updated = await updateClientStatut(client.id, statut);
      setClient(updated);
      toast.success('Statut mis à jour.');
    } catch {
      toast.error('Impossible de mettre à jour le statut.');
    } finally {
      setUpdatingStatut(false);
    }
  };

  const handleDelete = async () => {
    if (!client) return;
    if (!window.confirm(`Supprimer définitivement la fiche de ${client.prenom ?? ''} ${client.nom} ? Cette action est irréversible.`)) return;
    setDeleting(true);
    try {
      await deleteClient(client.id);
      toast.success('Prospect supprimé.');
      router.push('/prospects');
    } catch {
      toast.error('Impossible de supprimer ce prospect.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-8 py-10 max-w-5xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-[var(--line)]" />
          <div className="h-10 w-64 rounded bg-[var(--line)]" />
          <div className="h-40 rounded-2xl bg-[var(--line)]" />
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="px-8 py-10 max-w-4xl">
        <p className="text-[var(--accent-brick)] text-sm mb-4">{error ?? 'Client introuvable.'}</p>
        <Link href="/prospects" className="text-sm font-semibold underline underline-offset-4" style={{ color: 'var(--accent-secondary)' }}>
          Retour aux prospects
        </Link>
      </div>
    );
  }

  const statutCfg = STATUT_CLIENT_CONFIG[client.statut ?? 'nouveau'];

  return (
    <div className="px-8 py-10 max-w-5xl">
      <Link href="/prospects" className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent-secondary)' }}>
        ← Prospects
      </Link>

      {/* En-tête fiche client */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 mb-8">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
          >
            {(client.prenom?.[0] ?? client.nom[0] ?? '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl truncate">{client.prenom} {client.nom}</h1>
            <p className="text-sm text-[var(--ink-soft)] truncate">
              {client.entreprise && <span>{client.entreprise} · </span>}
              {client.email} · {client.telephone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={client.statut ?? 'nouveau'}
            disabled={updatingStatut}
            onChange={(e) => handleStatutChange(e.target.value as StatutClient)}
            className="text-xs font-semibold rounded-full px-3.5 py-2 outline-none border-0 cursor-pointer"
            style={{ background: statutCfg?.bg, color: statutCfg?.color }}
          >
            {Object.entries(STATUT_CLIENT_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <Link
            href={`/devis/nouveau?client=${client.id}`}
            className="btn-press text-white px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
          >
            + Devis
          </Link>
          <Link
            href={`/rendezvous/nouveau?client=${client.id}`}
            className="btn-press text-xs font-semibold rounded-full px-4 py-2 border border-[var(--line)] hover:border-[var(--accent-secondary)] transition-colors"
          >
            + RDV
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            title="Supprimer ce prospect"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:text-white hover:bg-[var(--accent-brick)] transition-colors disabled:opacity-40"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16zM10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      {client.message && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 mb-8 text-sm leading-relaxed">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--ink-soft)] mb-1.5">Message initial</p>
          {client.message}
        </div>
      )}

      {/* Stats résumées */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Devis', value: stats.totalDevis, from: 'var(--accent-primary)', to: 'var(--accent-secondary)' },
          { label: 'Devis validés', value: stats.devisValides, from: 'var(--accent-sage)', to: 'var(--accent-secondary)' },
          { label: 'Rendez-vous', value: stats.totalRdv, from: 'var(--accent-secondary)', to: 'var(--accent-primary)' },
          { label: 'Montant validé', value: formatMontant(stats.montantTotal), from: 'var(--accent-amber)', to: 'var(--accent-primary)' },
        ].map((s) => (
          <div key={s.label} className="card-hover relative overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--line)] px-5 py-4">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundImage: `linear-gradient(90deg, ${s.from}, ${s.to})` }} />
            <p className="font-mono-num text-[11px] uppercase tracking-wider text-[var(--ink-soft)]">{s.label}</p>
            <p
              className="font-display text-2xl font-semibold mt-1 bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Timeline unifiée */}
      <h2 className="font-display text-lg mb-4">Historique</h2>
      {timeline.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] p-10 text-center bg-[var(--surface)]">
          <p className="text-sm text-[var(--ink-soft)]">Aucun devis ni rendez-vous pour ce client pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: 'var(--line)' }} />
          {timeline.map((item, i) => (
            <div key={`${item.kind}-${item.kind === 'devis' ? item.devis.id : item.rdv.id}`} className="row-in relative" style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}>
              <span
                className="absolute -left-6 top-4 w-3.5 h-3.5 rounded-full border-2"
                style={{
                  background: 'var(--surface)',
                  borderColor: item.kind === 'devis' ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                }}
              />
              {item.kind === 'devis' ? (
                <Link
                  href={`/devis/${item.devis.id}`}
                  className="block rounded-2xl bg-[var(--surface)] border border-[var(--line)] px-5 py-4 hover:border-[var(--accent-primary)] transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--accent-primary)' }}>
                        Devis #{item.devis.id}
                      </p>
                      <p className="text-sm font-medium mt-0.5 truncate group-hover:text-[var(--accent-primary)] transition-colors">
                        {item.devis.besoins_client || 'Sans description'}
                      </p>
                      <p className="text-xs text-[var(--ink-soft)] font-mono-num mt-1">
                        {new Date(item.devis.date_creation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge statut={item.devis.statut} size="sm" />
                      <p className="font-mono-num text-sm font-semibold mt-1.5">{formatMontant(item.devis.estimation_montant)}</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  href={`/rendezvous/${item.rdv.id}`}
                  className="block rounded-2xl bg-[var(--surface)] border border-[var(--line)] px-5 py-4 hover:border-[var(--accent-secondary)] transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--accent-secondary)' }}>
                        Rendez-vous · {TYPE_RDV_CONFIG[item.rdv.type_rdv]?.icon} {TYPE_RDV_CONFIG[item.rdv.type_rdv]?.label}
                      </p>
                      <p className="text-sm font-medium mt-0.5 group-hover:text-[var(--accent-secondary)] transition-colors">
                        {new Date(item.rdv.date_rdv).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} à {item.rdv.heure_rdv?.slice(0, 5)}
                      </p>
                      {item.rdv.devis && (
                        <p className="text-xs text-[var(--ink-soft)] mt-1">Lié au devis #{item.rdv.devis}</p>
                      )}
                    </div>
                    <RdvStatusBadge statut={item.rdv.statut} size="sm" />
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
