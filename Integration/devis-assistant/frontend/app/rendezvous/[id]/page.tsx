'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchRendezVous, confirmerRendezVous, annulerRendezVous, terminerRendezVous, deleteRendezVous } from '@/lib/rendezvous';
import { RendezVous } from '@/lib/types';
import { TYPE_RDV_CONFIG } from '@/lib/statusRdv';
import RdvStatusBadge from '@/components/RdvStatusBadge';

function RendezVousDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [rdv, setRdv] = useState<RendezVous | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'warning'>('success');

  const load = useCallback(async () => {
    try {
      const data = await fetchRendezVous(id);
      setRdv(data);
      setError(null);
    } catch {
      setError('Impossible de charger ce rendez-vous.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const warning = searchParams.get('warning');
    const created = searchParams.get('created');
    if (warning) {
      setMessage(warning);
      setMessageType('warning');
    } else if (created) {
      setMessage('Rendez-vous créé — email de proposition envoyé au client.');
      setMessageType('success');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmer = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const result = await confirmerRendezVous(id);
      setRdv(result.rendezVous);
      if (result.emailError) {
        setMessage(`Rendez-vous confirmé, mais l'email n'a pas pu être envoyé : ${result.emailError}`);
        setMessageType('warning');
      } else {
        setMessage(`Rendez-vous confirmé. Email envoyé à ${result.rendezVous.client_nom ?? 'client'}.`);
        setMessageType('success');
      }
    } catch {
      setError('Impossible de confirmer ce rendez-vous.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnnuler = async () => {
    setActionLoading(true);
    try {
      const updated = await annulerRendezVous(id);
      setRdv(updated);
    } catch {
      setError('Impossible d’annuler ce rendez-vous.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminer = async () => {
    setActionLoading(true);
    try {
      const updated = await terminerRendezVous(id);
      setRdv(updated);
    } catch {
      setError('Impossible de clôturer ce rendez-vous.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!rdv) return;
    if (!window.confirm(`Supprimer définitivement ce rendez-vous avec ${rdv.client_nom ?? 'ce client'} ?`)) return;
    setDeleting(true);
    try {
      await deleteRendezVous(id);
      router.push('/rendezvous');
    } catch {
      setError('Impossible de supprimer ce rendez-vous.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-8 py-10">
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-4 w-32 rounded bg-[var(--line)]" />
          <div className="h-10 w-64 rounded bg-[var(--line)]" />
          <div className="h-64 rounded-2xl bg-[var(--line)]" />
        </div>
      </div>
    );
  }

  if (error || !rdv) {
    return (
      <div className="px-8 py-10 max-w-2xl">
        <p className="text-[var(--accent-brick)] text-sm mb-4">{error ?? 'Rendez-vous introuvable.'}</p>
        <Link href="/rendezvous" className="text-sm font-semibold underline underline-offset-4" style={{ color: 'var(--accent-secondary)' }}>
          Retour à la ligne directe
        </Link>
      </div>
    );
  }

  const typeCfg = TYPE_RDV_CONFIG[rdv.type_rdv];

  return (
    <div className="px-8 py-10 max-w-2xl">
      <Link href="/rendezvous" className="text-xs font-mono-num text-[var(--ink-soft)] hover:text-[var(--accent-secondary)] transition-colors">
        ← retour à la ligne directe
      </Link>

      <div className="mt-6 mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--accent-secondary)' }}>Ligne directe</p>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl">{rdv.client_nom}</h1>
            <RdvStatusBadge statut={rdv.statut} />
          </div>
          {rdv.client_entreprise && <p className="text-sm text-[var(--ink-soft)] mt-1">{rdv.client_entreprise}</p>}
        </div>
      </div>

      {message && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm border"
          style={
            messageType === 'warning'
              ? { background: '#FFF7E6', borderColor: 'var(--accent-amber)', color: '#92620A' }
              : { background: '#E9F9EF', borderColor: 'var(--accent-sage)', color: 'var(--accent-sage)' }
          }
        >
          {message}
        </div>
      )}

      <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden mb-6">
        <div className="grid grid-cols-2 divide-x divide-[var(--line)]">
          <div className="px-6 py-5">
            <p className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)] font-mono-num mb-1.5">Date &amp; heure</p>
            <p className="font-display text-xl">
              {new Date(rdv.date_rdv).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-sm text-[var(--ink-soft)] font-mono-num mt-0.5">{rdv.heure_rdv?.slice(0, 5)}</p>
          </div>
          <div className="px-6 py-5">
            <p className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)] font-mono-num mb-1.5">Type</p>
            <p className="font-display text-xl">{typeCfg?.icon} {typeCfg?.label ?? rdv.type_rdv}</p>
          </div>
        </div>

        <div className="border-t border-[var(--line)] px-6 py-5">
          <p className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)] font-mono-num mb-1.5">Contact client</p>
          <p className="text-sm">{rdv.client_email}</p>
          <p className="text-sm font-mono-num text-[var(--ink-soft)]">{rdv.client_telephone}</p>
        </div>

        {rdv.notes && (
          <div className="border-t border-[var(--line)] px-6 py-5">
            <p className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)] font-mono-num mb-1.5">Notes</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{rdv.notes}</p>
          </div>
        )}

        {rdv.devis && (
          <div className="border-t border-[var(--line)] px-6 py-5">
            <p className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)] font-mono-num mb-1.5">Devis lié</p>
            <Link href={`/devis/${rdv.devis}`} className="text-sm font-semibold" style={{ color: 'var(--accent-secondary)' }}>
              Voir le devis #{rdv.devis} →
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {rdv.statut === 'demande' && (
          <button
            type="button"
            onClick={handleConfirmer}
            disabled={actionLoading}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: 'var(--accent-sage)' }}
          >
            {actionLoading ? 'Confirmation...' : 'Confirmer le rendez-vous'}
          </button>
        )}
        {rdv.statut === 'confirme' && (
          <button
            type="button"
            onClick={handleTerminer}
            disabled={actionLoading}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
          >
            Marquer comme terminé
          </button>
        )}
        {(rdv.statut === 'demande' || rdv.statut === 'confirme') && (
          <button
            type="button"
            onClick={handleAnnuler}
            disabled={actionLoading}
            className="rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40 border"
            style={{ borderColor: 'var(--accent-brick)', color: 'var(--accent-brick)' }}
          >
            Annuler
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40 ml-auto"
          style={{ background: 'var(--accent-brick)' }}
        >
          {deleting ? 'Suppression...' : 'Supprimer'}
        </button>
      </div>
    </div>
  );
}

export default function RendezVousDetailPage() {
  return (
    <Suspense fallback={<div className="px-8 py-10 text-sm text-[var(--ink-soft)]">Chargement...</div>}>
      <RendezVousDetailContent />
    </Suspense>
  );
}
