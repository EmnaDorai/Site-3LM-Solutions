'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import devisApi from '@/lib/devisApi';
import { Client } from '@/lib/devisTypes';
import PageHeader from '@/components/PageHeader';

const EXEMPLES_BESOINS = [
  { label: 'Site vitrine', text: 'Site vitrine 5 pages, formulaire contact, design responsive, hébergement 1 an, livraison sous 3 semaines.' },
  { label: 'App mobile', text: 'Application mobile iOS/Android, authentification, notifications push, tableau de bord admin, budget ~15 000 €.' },
  { label: 'Formation', text: 'Formation Excel avancé pour 12 personnes, 2 jours sur site, supports PDF inclus, certification interne.' },
];

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold text-white shrink-0"
      style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>{n}</span>
  );
}

export default function NouveauDevisPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');
  const [besoins, setBesoins] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    devisApi.get('/clients/')
      .then((res) => setClients(res.data))
      .catch(() => setError('Impossible de charger les clients.'))
      .finally(() => setLoadingClients(false));
  }, []);

  const selectedClient = clients.find((c) => String(c.id) === clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await devisApi.post('/devis/', { client: clientId, besoins_client: besoins });
      router.push(`/devis/${res.data.id}?generer=1`);
    } catch {
      setError('Erreur lors de la création du devis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-10 max-w-3xl">
      <Link href="/devis" className="text-xs font-mono-num text-[var(--ink-soft)] hover:text-[var(--accent-primary)] transition-colors">← retour au registre</Link>

      <div className="mt-6 mb-8">
        <PageHeader eyebrow="Assistant IA" title="Nouveau devis" />
        <p className="text-sm text-[var(--ink-soft)] -mt-4">Décrivez les besoins du client — l&apos;assistant générera automatiquement le devis.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-3"><StepBadge n={1} /><span className="text-xs uppercase tracking-wider text-[var(--ink-soft)] font-mono-num">Client</span></div>
          {loadingClients ? (
            <p className="text-sm text-[var(--ink-soft)]">Chargement...</p>
          ) : clients.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">Aucun client disponible.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {clients.map((c) => {
                const selected = String(c.id) === clientId;
                return (
                  <button key={c.id} type="button" onClick={() => setClientId(String(c.id))}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${selected ? 'border-transparent bg-[var(--surface)] shadow-md' : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent-secondary)]'}`}>
                    <p className="font-medium text-sm">{c.nom}</p>
                    {c.entreprise && <p className="text-xs text-[var(--ink-soft)] mt-0.5">{c.entreprise}</p>}
                    <p className="text-xs text-[var(--ink-soft)] font-mono-num mt-1">{c.email}</p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3"><StepBadge n={2} /><label htmlFor="besoins" className="text-xs uppercase tracking-wider text-[var(--ink-soft)] font-mono-num">Besoins du client</label></div>
          <div className="flex flex-wrap gap-2 mb-3">
            {EXEMPLES_BESOINS.map((ex) => (
              <button key={ex.label} type="button" onClick={() => setBesoins(ex.text)} className="text-xs rounded-full border border-[var(--line)] px-3 py-1.5 hover:text-white transition-all duration-200"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'; e.currentTarget.style.borderColor = 'transparent'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundImage = 'none'; e.currentTarget.style.borderColor = 'var(--line)'; }}>
                {ex.label}
              </button>
            ))}
          </div>
          <textarea id="besoins" value={besoins} onChange={(e) => setBesoins(e.target.value)} required rows={8}
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm outline-none resize-none leading-relaxed transition-colors focus:border-[var(--accent-primary)]"
            placeholder="Notes prises pendant l'appel : besoins, contraintes, délais, budget indicatif..." />
          <p className="text-xs text-[var(--ink-soft)] mt-2 font-mono-num">{besoins.length} caractères · Plus le contexte est détaillé, meilleur sera le devis</p>
        </section>

        {error && <p className="text-sm text-[var(--accent-brick)]">{error}</p>}

        <section className="rounded-xl bg-[var(--surface)] border border-[var(--line)] p-6">
          <div className="flex items-center gap-2 mb-3"><StepBadge n={3} /><p className="text-xs uppercase tracking-wider text-[var(--ink-soft)] font-mono-num">Lancement</p></div>
          {selectedClient ? (
            <p className="text-sm mb-4">Devis pour <span className="font-medium">{selectedClient.nom}{selectedClient.entreprise ? ` — ${selectedClient.entreprise}` : ''}</span></p>
          ) : (
            <p className="text-sm text-[var(--accent-brick)] mb-4">Sélectionnez un client pour continuer.</p>
          )}
          <button type="submit" disabled={loading || !clientId || !besoins.trim()}
            className="w-full text-white py-3.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:grayscale flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
            {loading ? 'Création en cours...' : (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>Créer et générer avec l&apos;IA</>)}
          </button>
        </section>
      </form>
    </div>
  );
}
