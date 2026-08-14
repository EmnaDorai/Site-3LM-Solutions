'use client';

import { useEffect, useState } from 'react';
import { LigneDevis } from '@/lib/types';
import { calcTotalLignes, formatMontant, parseMontant } from '@/lib/devis';

interface DevisPreviewProps {
  lignes: LigneDevis[];
  estimation?: number | string | null;
  clientNom?: string;
  devisId?: number;
  readOnly?: boolean;
  onSave?: (lignes: LigneDevis[], estimation: number) => Promise<void>;
}

function emptyLigne(): LigneDevis {
  return { description: '', quantite: 1, prix_unitaire: 0 };
}

export default function DevisPreview({ lignes, estimation, clientNom, devisId, readOnly, onSave }: DevisPreviewProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LigneDevis[]>(lignes);
  const [draftEstimation, setDraftEstimation] = useState<string>(String(parseMontant(estimation) || ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(lignes);
      setDraftEstimation(String(parseMontant(estimation) || ''));
    }
  }, [lignes, estimation, editing]);

  const total = calcTotalLignes(editing ? draft : lignes);
  const hasLignes = (editing ? draft : lignes).length > 0;

  const startEditing = () => {
    setDraft(lignes.length > 0 ? lignes.map((l) => ({ ...l })) : [emptyLigne()]);
    setDraftEstimation(String(parseMontant(estimation) || calcTotalLignes(lignes) || ''));
    setError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError(null);
  };

  const updateLigne = (index: number, patch: Partial<LigneDevis>) => {
    setDraft((d) => d.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const removeLigne = (index: number) => {
    setDraft((d) => d.filter((_, i) => i !== index));
  };

  const addLigne = () => {
    setDraft((d) => [...d, emptyLigne()]);
  };

  const handleSave = async () => {
    if (!onSave) return;
    const cleaned = draft
      .map((l) => ({ ...l, description: l.description.trim() }))
      .filter((l) => l.description.length > 0);

    if (cleaned.length === 0) {
      setError('Ajoutez au moins une ligne avec une description.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(cleaned, parseMontant(draftEstimation) || calcTotalLignes(cleaned));
      setEditing(false);
    } catch {
      setError('Impossible d’enregistrer les modifications.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex flex-col overflow-hidden max-h-[calc(100vh-170px)]">
      <div className="px-6 py-5 border-b border-[var(--line)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--accent-secondary)' }}>
            Aperçu du devis
          </p>
          <h2 className="font-display text-xl truncate">
            {clientNom ?? 'Client'}
            {devisId != null && (
              <span className="text-[var(--ink-soft)] font-normal text-base ml-2">#{devisId}</span>
            )}
          </h2>
        </div>

        {!readOnly && lignes.length > 0 && !editing && (
          <button
            type="button"
            onClick={startEditing}
            className="shrink-0 text-xs font-semibold rounded-full px-3.5 py-2 border border-[var(--line)] hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)] transition-colors flex items-center gap-1.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </button>
        )}
      </div>

      {!hasLignes && !editing ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white"
            style={{ background: 'var(--accent-primary)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
            </svg>
          </div>
          <p className="text-sm text-[var(--ink-soft)] max-w-xs">
            Les lignes du devis apparaîtront ici après génération par l&apos;assistant IA.
          </p>
        </div>
      ) : editing ? (
        <>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {draft.map((ligne, i) => (
              <div key={i} className="rounded-xl border border-[var(--line)] p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <textarea
                    value={ligne.description}
                    onChange={(e) => updateLigne(i, { description: e.target.value })}
                    placeholder="Description de la ligne"
                    rows={2}
                    className="flex-1 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none resize-none focus:border-[var(--accent-secondary)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeLigne(i)}
                    title="Supprimer cette ligne"
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink-soft)] hover:text-white hover:bg-[var(--accent-brick)] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16zM10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)] block mb-1">Qté</label>
                    <input
                      type="number"
                      min={1}
                      value={ligne.quantite}
                      onChange={(e) => updateLigne(i, { quantite: Number(e.target.value) || 1 })}
                      className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1.5 text-sm font-mono-num outline-none focus:border-[var(--accent-secondary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)] block mb-1">P.U. (DT)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={ligne.prix_unitaire}
                      onChange={(e) => updateLigne(i, { prix_unitaire: e.target.value })}
                      className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1.5 text-sm font-mono-num outline-none focus:border-[var(--accent-secondary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)] block mb-1">Total</label>
                    <p className="px-2.5 py-1.5 text-sm font-mono-num font-semibold">
                      {formatMontant(ligne.quantite * parseMontant(ligne.prix_unitaire))}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addLigne}
              className="w-full text-xs font-semibold rounded-lg border border-dashed border-[var(--line)] py-2.5 text-[var(--ink-soft)] hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)] transition-colors"
            >
              + Ajouter une ligne
            </button>
          </div>

          <div className="border-t border-[var(--line)] px-6 py-5 space-y-3" style={{ background: '#FAFAFB' }}>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--ink-soft)]">Sous-total lignes</span>
              <span className="font-mono-num font-medium">{formatMontant(calcTotalLignes(draft))}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="estimation" className="font-semibold">Estimation finale</label>
              <input
                id="estimation"
                type="number"
                min={0}
                step="0.01"
                value={draftEstimation}
                onChange={(e) => setDraftEstimation(e.target.value)}
                className="w-32 text-right rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-sm font-mono-num font-bold outline-none focus:border-[var(--accent-primary)] transition-colors"
                style={{ color: 'var(--accent-primary)' }}
              />
            </div>

            {error && <p className="text-xs text-[var(--accent-brick)]">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="flex-1 text-sm font-semibold rounded-lg border border-[var(--line)] py-2.5 transition-colors hover:border-[var(--accent-brick)] hover:text-[var(--accent-brick)] disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-press flex-1 text-sm font-semibold text-white rounded-lg py-2.5 transition-all duration-200 disabled:opacity-40"
                style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-[1fr_64px_96px_96px] px-5 py-3 text-xs font-semibold text-[var(--ink-soft)] border-b border-[var(--line)] sticky top-0 bg-[var(--surface)]">
              <span>Description</span>
              <span className="text-right">Qté</span>
              <span className="text-right">P.U.</span>
              <span className="text-right">Total</span>
            </div>
            {lignes.map((ligne, i) => {
              const ligneTotal = ligne.total ?? ligne.quantite * parseMontant(ligne.prix_unitaire);
              return (
                <div
                  key={ligne.id ?? i}
                  className="grid grid-cols-[1fr_64px_96px_96px] px-5 py-3.5 items-start border-b border-[var(--line)] last:border-0 text-sm transition-colors"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FFF6F3')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="pr-4 leading-snug">{ligne.description}</span>
                  <span className="text-right font-mono-num text-[var(--ink-soft)]">{ligne.quantite}</span>
                  <span className="text-right font-mono-num text-[var(--ink-soft)]">{formatMontant(ligne.prix_unitaire)}</span>
                  <span className="text-right font-mono-num font-semibold">{formatMontant(ligneTotal)}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[var(--line)] px-6 py-5 space-y-2" style={{ background: '#FAFAFB' }}>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--ink-soft)]">Sous-total lignes</span>
              <span className="font-mono-num font-medium">{formatMontant(total)}</span>
            </div>
            {estimation != null && parseMontant(estimation) > 0 && (
              <div className="flex justify-between items-center text-sm pt-3 mt-1 border-t border-[var(--line)]">
                <span className="font-semibold">Estimation IA</span>
                <span
                  className="font-mono-num font-bold text-xl px-3 py-1 rounded-lg"
                  style={{ color: 'var(--accent-primary)', background: '#FFF1EC' }}
                >
                  {formatMontant(estimation)}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
