'use client';

import { useState } from 'react';
import AiPulse from './AiPulse';

interface AssistantPanelProps {
  besoins: string;
  synthese?: string;
  generating: boolean;
  error?: string | null;
  onGenerate: (instructions: string) => void;
  onUpdateBesoins?: (besoins: string) => void;
  readOnly?: boolean;
}

const PROMPT_SUGGESTIONS = [
  'Ajouter une ligne maintenance annuelle',
  'Proposer une option premium',
  'Réduire le budget de 20 %',
  'Détailler les délais de livraison',
];

export default function AssistantPanel({
  besoins,
  synthese,
  generating,
  error,
  onGenerate,
  onUpdateBesoins,
  readOnly = false,
}: AssistantPanelProps) {
  const [instructions, setInstructions] = useState('');
  const [showBesoinsEdit, setShowBesoinsEdit] = useState(false);
  const [editedBesoins, setEditedBesoins] = useState(besoins);

  const handleGenerate = () => {
    onGenerate(instructions);
    setInstructions('');
  };

  const hasSynthese = Boolean(synthese?.trim());

  return (
    <div className="flex flex-col">
      <div className="px-6 py-5 border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', boxShadow: 'var(--shadow-glow)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="font-display font-semibold text-sm">Assistant IA</p>
            <p className="text-xs text-[var(--ink-soft)]">Analyse les besoins et génère le devis</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Message utilisateur : besoins */}
        <div className="flex gap-3">
          <div className="w-7 h-7 shrink-0 rounded-full bg-[var(--line)] flex items-center justify-center text-[10px] font-mono-num uppercase">
            V
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)] font-mono-num mb-1.5">
              Besoins client
            </p>
            {showBesoinsEdit && onUpdateBesoins ? (
              <div className="space-y-2">
                <textarea
                  value={editedBesoins}
                  onChange={(e) => setEditedBesoins(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none resize-none focus:border-[var(--accent-primary)] transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateBesoins(editedBesoins);
                      setShowBesoinsEdit(false);
                    }}
                    className="text-xs text-white px-3 py-1.5 rounded-lg font-medium"
                    style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditedBesoins(besoins);
                      setShowBesoinsEdit(false);
                    }}
                    className="text-xs text-[var(--ink-soft)] px-3 py-1.5"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl rounded-tl-sm bg-[var(--surface)] border border-[var(--line)] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                {besoins}
                {!readOnly && onUpdateBesoins && (
                  <button
                    type="button"
                    onClick={() => setShowBesoinsEdit(true)}
                    className="block mt-2 text-xs font-medium hover:underline"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Modifier
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Réponse IA */}
        {generating ? (
          <AiPulse />
        ) : hasSynthese ? (
          <div className="flex gap-3">
            <div
              className="w-7 h-7 shrink-0 rounded-full text-white flex items-center justify-center text-[10px] font-mono-num"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
            >
              IA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)] font-mono-num mb-1.5">
                Synthèse générée
              </p>
              <div
                className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.06), rgba(0,212,199,0.06))',
                  border: '1px solid rgba(108,92,231,0.2)',
                }}
              >
                {synthese}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-center bg-[var(--surface)]/50">
            <p className="text-sm text-[var(--ink-soft)] mb-4">
              Aucune synthèse générée. Lancez l&apos;assistant pour créer le devis.
            </p>
            {!readOnly && (
              <button
                type="button"
                onClick={() => onGenerate('')}
                disabled={generating}
                className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-40 hover:shadow-lg hover:-translate-y-0.5"
                style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Générer le devis
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-[var(--accent-brick)]/10 border border-[var(--accent-brick)]/30 px-4 py-3 text-sm text-[var(--accent-brick)]">
            {error}
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="border-t border-[var(--line)] p-5 bg-[var(--surface)] space-y-3">
          {hasSynthese && (
            <div className="flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInstructions(suggestion)}
                  className="text-xs rounded-full border border-[var(--line)] px-2.5 py-1 transition-all duration-200 hover:text-white"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundImage = 'none';
                    e.currentTarget.style.borderColor = 'var(--line)';
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !generating && handleGenerate()}
              placeholder={
                hasSynthese ? 'Affinez le devis (ex. ajouter une ligne...)' : "Instructions optionnelles pour l'IA..."
              }
              disabled={generating}
              className="flex-1 rounded-full border border-[var(--line)] bg-transparent px-4 py-2.5 text-sm outline-none disabled:opacity-50 focus:border-[var(--accent-primary)] transition-colors"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="btn-press shrink-0 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-40 flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
            >
              {generating ? (
                'Génération...'
              ) : hasSynthese ? (
                'Regénérer'
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Générer
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}