'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { createRendezVous } from '@/lib/rendezvous';
import { Client, Devis } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import { TYPE_RDV_CONFIG } from '@/lib/statusRdv';

function StepBadge({ n }: { n: number }) {
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold text-white shrink-0"
      style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
    >
      {n}
    </span>
  );
}

function NouveauRendezVousForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get('client') ?? '';
  const preselectedDevis = searchParams.get('devis') ?? '';

  const [clients, setClients] = useState<Client[]>([]);
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const [clientId, setClientId] = useState(preselectedClient);
  const [devisId, setDevisId] = useState(preselectedDevis);
  const [dateRdv, setDateRdv] = useState('');
  const [heureRdv, setHeureRdv] = useState('');
  const [typeRdv, setTypeRdv] = useState('appel');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/clients/')
      .then((res) => setClients(res.data))
      .catch(() => setError('Impossible de charger les clients.'))
      .finally(() => setLoadingClients(false));
  }, []);

  useEffect(() => {
    if (!clientId) {
      setDevisList([]);
      return;
    }
    api
      .get('/devis/')
      .then((res) => setDevisList((res.data as Devis[]).filter((d) => String(d.client) === String(clientId))))
      .catch(() => setDevisList([]));
  }, [clientId]);

  const selectedClient = clients.find((c) => String(c.id) === clientId);
  const isPrefilled = Boolean(preselectedClient);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const rdv = await createRendezVous({
        client: clientId,
        devis: devisId || null,
        date_rdv: dateRdv,
        heure_rdv: heureRdv,
        type_rdv: typeRdv,
        notes,
      });
      const query = rdv.email_warning ? `?warning=${encodeURIComponent(rdv.email_warning)}` : '?created=1';
      router.push(`/rendezvous/${rdv.id}${query}`);
    } catch {
      setError('Erreur lors de la création du rendez-vous.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-10 max-w-3xl">
      <Link
        href="/rendezvous"
        className="text-xs font-mono-num text-[var(--ink-soft)] hover:text-[var(--accent-secondary)] transition-colors"
      >
        ← retour à la ligne directe
      </Link>

      <div className="mt-6 mb-8">
        <PageHeader eyebrow="Ligne directe" title="Proposer un rendez-vous" />
        <p className="text-sm text-[var(--ink-soft)] -mt-4">
          Planifiez un appel, une visio ou un rendez-vous sur site avec le client.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <StepBadge n={1} />
            <span className="text-xs uppercase tracking-wider text-[var(--ink-soft)] font-mono-num">Client</span>
          </div>

          {isPrefilled && selectedClient ? (
            <div className="rounded-xl border-2 border-transparent bg-[var(--surface)] p-4 shadow-md">
              <p className="font-medium text-sm">{selectedClient.nom}</p>
              {selectedClient.entreprise && <p className="text-xs text-[var(--ink-soft)] mt-0.5">{selectedClient.entreprise}</p>}
              <p className="text-xs text-[var(--ink-soft)] font-mono-num mt-1">{selectedClient.email}</p>
              {preselectedDevis && (
                <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                  Lié au devis #{preselectedDevis}
                </p>
              )}
            </div>
          ) : loadingClients ? (
            <p className="text-sm text-[var(--ink-soft)]">Chargement...</p>
          ) : clients.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">Aucun client disponible.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {clients.map((c) => {
                const selected = String(c.id) === clientId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setClientId(String(c.id));
                      setDevisId('');
                    }}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      selected ? 'border-transparent bg-[var(--surface)] shadow-md' : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent-secondary)]'
                    }`}
                    style={
                      selected
                        ? {
                            backgroundImage:
                              'linear-gradient(var(--surface), var(--surface)), linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))',
                            backgroundOrigin: 'border-box',
                            backgroundClip: 'padding-box, border-box',
                          }
                        : undefined
                    }
                  >
                    <p className="font-medium text-sm">{c.nom}</p>
                    {c.entreprise && <p className="text-xs text-[var(--ink-soft)] mt-0.5">{c.entreprise}</p>}
                    <p className="text-xs text-[var(--ink-soft)] font-mono-num mt-1">{c.email}</p>
                  </button>
                );
              })}
            </div>
          )}

          {!isPrefilled && clientId && devisList.length > 0 && (
            <div className="mt-4">
              <label className="text-xs uppercase tracking-wider text-[var(--ink-soft)] font-mono-num block mb-2">
                Rattacher à un devis (facultatif)
              </label>
              <select
                value={devisId}
                onChange={(e) => setDevisId(e.target.value)}
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors"
              >
                <option value="">Aucun devis</option>
                {devisList.map((d) => (
                  <option key={d.id} value={d.id}>
                    Devis #{d.id} — {d.statut}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* Date / heure / type */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <StepBadge n={2} />
            <span className="text-xs uppercase tracking-wider text-[var(--ink-soft)] font-mono-num">Créneau</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="date_rdv" className="text-xs text-[var(--ink-soft)] block mb-1.5">Date</label>
              <input
                id="date_rdv"
                type="date"
                value={dateRdv}
                onChange={(e) => setDateRdv(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="heure_rdv" className="text-xs text-[var(--ink-soft)] block mb-1.5">Heure</label>
              <input
                id="heure_rdv"
                type="time"
                value={heureRdv}
                onChange={(e) => setHeureRdv(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors"
              />
            </div>
          </div>

          <label className="text-xs text-[var(--ink-soft)] block mb-2">Type de rendez-vous</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(TYPE_RDV_CONFIG).map(([key, cfg]) => {
              const active = typeRdv === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTypeRdv(key)}
                  className="text-sm rounded-full border px-4 py-2 transition-all duration-200 flex items-center gap-1.5"
                  style={
                    active
                      ? { backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))', color: '#fff', borderColor: 'transparent' }
                      : { borderColor: 'var(--line)' }
                  }
                >
                  <span>{cfg.icon}</span>
                  {cfg.label}
                </button>
              );
            })}
          </div>

          <label htmlFor="notes" className="text-xs text-[var(--ink-soft)] block mb-1.5">Notes / objet (facultatif)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm outline-none resize-none leading-relaxed transition-colors focus:border-[var(--accent-secondary)]"
            placeholder="Ex. présenter le devis, ajuster le budget, questions techniques..."
          />
        </section>

        {error && <p className="text-sm text-[var(--accent-brick)]">{error}</p>}

        <section className="rounded-xl bg-[var(--surface)] border border-[var(--line)] p-6">
          <div className="flex items-center gap-2 mb-3">
            <StepBadge n={3} />
            <p className="text-xs uppercase tracking-wider text-[var(--ink-soft)] font-mono-num">Confirmation</p>
          </div>
          {!clientId && <p className="text-sm text-[var(--accent-brick)] mb-4">Sélectionnez un client pour continuer.</p>}

          <button
            type="submit"
            disabled={loading || !clientId || !dateRdv || !heureRdv}
            className="w-full text-white py-3.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:grayscale flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
          >
            {loading ? 'Création en cours...' : 'Proposer ce rendez-vous'}
          </button>
        </section>
      </form>
    </div>
  );
}

export default function NouveauRendezVousPage() {
  return (
    <Suspense fallback={<div className="px-8 py-10 text-sm text-[var(--ink-soft)]">Chargement...</div>}>
      <NouveauRendezVousForm />
    </Suspense>
  );
}
