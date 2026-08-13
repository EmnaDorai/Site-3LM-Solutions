// DevisDetailPage.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AssistantPanel from '@/components/AssistantPanel';
import DevisPreview from '@/components/DevisPreview';
import StatusBadge from '@/components/StatusBadge';
import LigneDirectePanel from '@/components/LigneDirectePanel';
import { Devis } from '@/lib/types';
import { fetchDevis, genererDevisIA, updateDevis, validerDevis, telechargerPdfDevis, deleteDevis } from '@/lib/devis';

export default function DevisDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;

  const [devis, setDevis] = useState<Devis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [validating, setValidating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const loadDevis = useCallback(async () => {
    try {
      const data = await fetchDevis(id);
      setDevis(data);
      setError(null);
    } catch {
      setError('Impossible de charger ce devis.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadDevis(); }, [loadDevis]);

  const handleGenerate = async (instructions: string) => {
    setGenerating(true);
    setGenError(null);
    try {
      const updated = await genererDevisIA(id, instructions);
      setDevis(updated);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Erreur lors de la génération. Vérifiez la clé OpenAI.';
      setGenError(msg);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('generer') === '1' && devis && !devis.synthese_ia && !generating) {
      handleGenerate('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devis?.id, searchParams]);

  const handleUpdateBesoins = async (besoins: string) => {
    try {
      const updated = await updateDevis(id, { besoins_client: besoins });
      setDevis(updated);
    } catch {
      setGenError('Impossible de mettre à jour les besoins.');
    }
  };

  const handleValider = async () => {
    if (!devis?.synthese_ia) return;
    setValidating(true);
    setValidationMessage(null);
    try {
      const updated = await validerDevis(id);
      setDevis(updated);
      setValidationMessage(
        updated.statut === 'envoye'
          ? `Devis validé et envoyé automatiquement à ${updated.client_nom} par email.`
          : "Devis validé, mais l'envoi automatique de l'email a échoué. Vous pouvez télécharger le PDF manuellement."
      );
    } catch {
      setGenError('Impossible de valider le devis.');
    } finally {
      setValidating(false);
    }
  };

  const handleTelechargerPdf = async () => {
    setDownloading(true);
    try {
      await telechargerPdfDevis(id);
    } catch {
      setGenError('Impossible de télécharger le PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!devis) return;
    if (!window.confirm(`Supprimer définitivement le devis de ${devis.client_nom ?? 'ce client'} ? Cette action est irréversible.`)) return;
    setDeleting(true);
    try {
      await deleteDevis(id);
      router.push('/devis');
    } catch {
      setGenError('Impossible de supprimer ce devis.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-8 py-10">
        <div className="animate-pulse space-y-4 max-w-4xl">
          <div className="h-4 w-32 rounded bg-[var(--line)]" />
          <div className="h-10 w-64 rounded bg-[var(--line)]" />
          <div className="h-96 rounded-2xl bg-[var(--line)]" />
        </div>
      </div>
    );
  }

  if (error || !devis) {
    return (
      <div className="px-8 py-10 max-w-4xl">
        <p className="text-[var(--accent-brick)] text-sm mb-4">{error ?? 'Devis introuvable.'}</p>
        <Link href="/devis" className="text-sm font-semibold underline underline-offset-4" style={{ color: 'var(--accent-secondary)' }}>
          Retour au registre
        </Link>
      </div>
    );
  }

  const isValide = devis.statut === 'valide' || devis.statut === 'envoye';
  const canValidate = Boolean(devis.synthese_ia) && devis.statut === 'brouillon';

  return (
    <div className="flex flex-col h-screen">
      <header className="shrink-0 px-8 py-5 border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Link href="/devis" className="text-xs font-semibold uppercase tracking-wide transition-colors" style={{ color: 'var(--accent-secondary)' }}>
              ← Registre
            </Link>
            <div className="flex items-center gap-3 mt-2">
              <h1 className="font-display text-2xl truncate">{devis.client_nom}</h1>
              <StatusBadge statut={devis.statut} />
            </div>
            <p className="text-xs text-[var(--ink-soft)] mt-1">
              Devis #{devis.id} · {new Date(devis.date_creation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {canValidate && (
              <button
                type="button"
                onClick={handleValider}
                disabled={validating || generating}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                style={{ background: 'var(--accent-sage)' }}
              >
                {validating ? 'Validation...' : 'Valider le devis'}
              </button>
            )}
            {isValide && (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1" style={{ background: '#E9F9EF', color: 'var(--accent-sage)' }}>
                  ✓ Devis validé
                </span>
                <button
                  type="button"
                  onClick={handleTelechargerPdf}
                  disabled={downloading}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                  style={{ background: 'var(--accent-primary)' }}
                >
                  {downloading ? 'Téléchargement...' : '⬇ Télécharger le PDF'}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              title="Supprimer ce devis"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:text-white hover:bg-[var(--accent-brick)] transition-colors disabled:opacity-40"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16zM10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-5">
          {[
            { label: 'Besoins', done: Boolean(devis.besoins_client) },
            { label: 'Génération IA', done: Boolean(devis.synthese_ia) },
            { label: 'Validation', done: isValide },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px" style={{ background: 'var(--line)' }} />}
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: step.done ? 'var(--accent-sage)' : 'var(--ink-soft)' }}>
                <span
                  className="w-5 h-5 flex items-center justify-center rounded-full text-[10px]"
                  style={step.done ? { background: 'var(--accent-sage)', color: '#fff' } : { border: '1.5px solid var(--line)' }}
                >
                  {step.done ? '✓' : i + 1}
                </span>
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </header>

      <LigneDirectePanel devisId={devis.id} clientId={devis.client} />

      {validationMessage && (
        <div className="px-8 py-3 text-sm border-b" style={{ background: '#E9F9EF', borderColor: 'var(--accent-sage)', color: 'var(--accent-sage)' }}>
          {validationMessage}
        </div>
      )}

      <div className="flex-1 grid lg:grid-cols-2 min-h-0 divide-x divide-[var(--line)]">
        <div className="min-h-0 overflow-hidden bg-[var(--paper)]">
          <AssistantPanel
            besoins={devis.besoins_client}
            synthese={devis.synthese_ia}
            generating={generating}
            error={genError}
            onGenerate={handleGenerate}
            onUpdateBesoins={isValide ? undefined : handleUpdateBesoins}
            readOnly={isValide}
          />
        </div>
        <div className="min-h-0 overflow-hidden bg-[var(--paper)] p-5">
          <DevisPreview lignes={devis.lignes ?? []} estimation={devis.estimation_montant} clientNom={devis.client_nom} devisId={devis.id} />
        </div>
      </div>
    </div>
  );
}