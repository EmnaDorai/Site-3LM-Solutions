import { LigneDevis } from '@/lib/types';
import { calcTotalLignes, formatMontant, parseMontant } from '@/lib/devis';

interface DevisPreviewProps {
  lignes: LigneDevis[];
  estimation?: number | string | null;
  clientNom?: string;
  devisId?: number;
}

export default function DevisPreview({ lignes, estimation, clientNom, devisId }: DevisPreviewProps) {
  const total = calcTotalLignes(lignes);
  const hasLignes = lignes.length > 0;

  return (
    <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] h-full flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--line)]">
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--accent-secondary)' }}>
          Aperçu du devis
        </p>
        <h2 className="font-display text-xl">
          {clientNom ?? 'Client'}
          {devisId != null && (
            <span className="text-[var(--ink-soft)] font-normal text-base ml-2">#{devisId}</span>
          )}
        </h2>
      </div>

      {!hasLignes ? (
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