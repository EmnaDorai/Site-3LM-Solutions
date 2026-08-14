'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { fetchClients } from '@/lib/clients';
import { fetchRendezVousList, confirmerRendezVous } from '@/lib/rendezvous';
import { formatMontant } from '@/lib/devis';
import { Client, Devis, RendezVous } from '@/lib/types';
import { TYPE_RDV_CONFIG } from '@/lib/statusRdv';
import { STATUT_CLIENT_CONFIG } from '@/lib/statusClient';
import PageHeader from '@/components/PageHeader';
import { useToast } from '@/components/ToastProvider';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function StatCard({ label, value, from, to, href }: { label: string; value: number; from: string; to: string; href?: string }) {
  const content = (
    <div className="card-hover relative overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--line)] px-5 py-4 h-full">
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundImage: `linear-gradient(90deg, ${from}, ${to})` }} />
      <p className="font-mono-num text-[11px] uppercase tracking-wider text-[var(--ink-soft)]">{label}</p>
      <p className="font-display text-3xl font-semibold mt-1 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}>
        {value}
      </p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function DashboardPage() {
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [rdvList, setRdvList] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetchClients().catch(() => []),
      api.get('/devis/').then((r) => r.data).catch(() => []),
      fetchRendezVousList().catch(() => []),
    ]).then(([c, d, r]) => {
      setClients(c);
      setDevisList(d);
      setRdvList(r);
      setLoading(false);
    });
  }, []);

  const today = todayISO();

  const rdvAujourdhui = useMemo(
    () => rdvList.filter((r) => r.date_rdv === today && r.statut !== 'annule').sort((a, b) => a.heure_rdv.localeCompare(b.heure_rdv)),
    [rdvList, today]
  );
  const rdvAConfirmer = useMemo(
    () => rdvList.filter((r) => r.statut === 'demande').sort((a, b) => a.date_rdv.localeCompare(b.date_rdv)),
    [rdvList]
  );
  const devisEnAttente = useMemo(
    () => devisList.filter((d) => d.statut === 'brouillon' || d.statut === 'en_attente'),
    [devisList]
  );
  const nouveauxProspects = useMemo(
    () =>
      clients
        .filter((c) => c.statut === 'nouveau' || !c.statut)
        .sort((a, b) => (a.date_creation < b.date_creation ? 1 : -1))
        .slice(0, 5),
    [clients]
  );

  const handleConfirmer = async (id: number) => {
    setConfirmingId(id);
    try {
      const { rendezVous } = await confirmerRendezVous(id);
      setRdvList((list) => list.map((r) => (r.id === id ? rendezVous : r)));
      toast.success('Rendez-vous confirmé.');
    } catch {
      toast.error('Impossible de confirmer ce rendez-vous.');
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="px-8 py-10 max-w-6xl">
      <PageHeader
        eyebrow="Espace équipe"
        title="Tableau de bord"
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/devis/nouveau"
              className="btn-press text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
            >
              <span className="text-lg leading-none">+</span>Nouveau devis
            </Link>
            <Link
              href="/rendezvous/nouveau"
              className="text-sm font-medium px-5 py-2.5 rounded-full border border-[var(--line)] hover:border-[var(--accent-secondary)] transition-colors"
            >
              + Rendez-vous
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-2xl bg-[var(--line)]/50 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Prospects nouveaux" value={nouveauxProspects.length} from="var(--accent-amber)" to="var(--accent-primary)" href="/prospects" />
          <StatCard label="RDV à confirmer" value={rdvAConfirmer.length} from="var(--accent-secondary)" to="var(--accent-primary)" href="/rendezvous" />
          <StatCard label="Devis en attente" value={devisEnAttente.length} from="var(--accent-primary)" to="var(--accent-secondary)" href="/devis" />
          <StatCard label="RDV aujourd'hui" value={rdvAujourdhui.length} from="var(--accent-sage)" to="var(--accent-secondary)" href="/rendezvous" />
        </div>
      )}

      {!loading && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* À traiter : RDV à confirmer */}
          <section className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
              <h2 className="font-display text-base">Rendez-vous à confirmer</h2>
              <Link href="/rendezvous" className="text-xs font-mono-num text-[var(--ink-soft)] hover:text-[var(--accent-secondary)] transition-colors">
                Tout voir →
              </Link>
            </div>
            {rdvAConfirmer.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[var(--ink-soft)]">Rien à confirmer pour l&apos;instant — bien joué !</p>
            ) : (
              <div>
                {rdvAConfirmer.slice(0, 6).map((rdv, i) => (
                  <div
                    key={rdv.id}
                    className="row-in flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--line)] last:border-0 transition-colors hover:bg-[rgba(108,92,231,0.03)]"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <Link href={`/rendezvous/${rdv.id}`} className="min-w-0 flex-1 group">
                      <p className="text-sm font-medium truncate group-hover:text-[var(--accent-secondary)] transition-colors">
                        {rdv.client_nom}
                        {rdv.source === 'public' && (
                          <span className="ml-2 text-[9px] uppercase tracking-wider font-mono-num px-1.5 py-0.5 rounded-full" style={{ background: '#E8ECFB', color: 'var(--accent-secondary)' }}>
                            En ligne
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--ink-soft)] font-mono-num">
                        {TYPE_RDV_CONFIG[rdv.type_rdv]?.icon} {new Date(rdv.date_rdv).toLocaleDateString('fr-FR')} · {rdv.heure_rdv?.slice(0, 5)}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleConfirmer(rdv.id)}
                      disabled={confirmingId === rdv.id}
                      className="btn-press shrink-0 text-xs font-semibold rounded-full px-3.5 py-1.5 text-white transition-opacity disabled:opacity-40"
                      style={{ background: 'var(--accent-sage)' }}
                    >
                      ✓ Confirmer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Agenda du jour */}
          <section className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
              <h2 className="font-display text-base">Aujourd&apos;hui</h2>
              <span className="text-xs font-mono-num text-[var(--ink-soft)]">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            {rdvAujourdhui.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[var(--ink-soft)]">Aucun rendez-vous prévu aujourd&apos;hui.</p>
            ) : (
              <div>
                {rdvAujourdhui.map((rdv, i) => (
                  <Link
                    key={rdv.id}
                    href={`/rendezvous/${rdv.id}`}
                    className="row-in flex items-center gap-4 px-5 py-3.5 border-b border-[var(--line)] last:border-0 group transition-colors hover:bg-[rgba(108,92,231,0.03)]"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <span className="font-mono-num text-sm font-semibold w-14 shrink-0 group-hover:text-[var(--accent-secondary)] transition-colors">
                      {rdv.heure_rdv?.slice(0, 5)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{rdv.client_nom}</p>
                      <p className="text-xs text-[var(--ink-soft)]">{TYPE_RDV_CONFIG[rdv.type_rdv]?.icon} {TYPE_RDV_CONFIG[rdv.type_rdv]?.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Prospects récents */}
          <section className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
              <h2 className="font-display text-base">Nouveaux prospects</h2>
              <Link href="/prospects" className="text-xs font-mono-num text-[var(--ink-soft)] hover:text-[var(--accent-secondary)] transition-colors">
                Tout voir →
              </Link>
            </div>
            {nouveauxProspects.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[var(--ink-soft)]">Aucun nouveau prospect pour l&apos;instant.</p>
            ) : (
              <div>
                {nouveauxProspects.map((c, i) => (
                  <div
                    key={c.id}
                    className="row-in flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--line)] last:border-0 transition-colors hover:bg-[rgba(108,92,231,0.03)]"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.prenom} {c.nom}</p>
                      <p className="text-xs text-[var(--ink-soft)] truncate">{c.entreprise ? `${c.entreprise} · ` : ''}{c.email}</p>
                    </div>
                    <span
                      className="shrink-0 text-[10px] font-semibold rounded-full px-2.5 py-1"
                      style={{ background: STATUT_CLIENT_CONFIG[c.statut ?? 'nouveau']?.bg, color: STATUT_CLIENT_CONFIG[c.statut ?? 'nouveau']?.color }}
                    >
                      {STATUT_CLIENT_CONFIG[c.statut ?? 'nouveau']?.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Devis en attente */}
          <section className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
              <h2 className="font-display text-base">Devis en attente</h2>
              <Link href="/devis" className="text-xs font-mono-num text-[var(--ink-soft)] hover:text-[var(--accent-primary)] transition-colors">
                Tout voir →
              </Link>
            </div>
            {devisEnAttente.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[var(--ink-soft)]">Aucun devis en attente — tout est à jour.</p>
            ) : (
              <div>
                {devisEnAttente.slice(0, 6).map((d, i) => (
                  <Link
                    key={d.id}
                    href={`/devis/${d.id}`}
                    className="row-in flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--line)] last:border-0 group transition-colors hover:bg-[rgba(108,92,231,0.03)]"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-[var(--accent-primary)] transition-colors">
                        {d.client_nom}
                        {!d.synthese_ia && <span className="ml-2 text-[11px] text-[var(--accent-amber)] font-mono-num">à générer</span>}
                      </p>
                      <p className="text-xs text-[var(--ink-soft)] font-mono-num">{new Date(d.date_creation).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <span className="shrink-0 font-mono-num text-sm">{formatMontant(d.estimation_montant)}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
