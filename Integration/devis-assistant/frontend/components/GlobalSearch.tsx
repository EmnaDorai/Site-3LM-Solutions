'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { fetchClients } from '@/lib/clients';
import { fetchRendezVousList } from '@/lib/rendezvous';
import { Client, Devis, RendezVous } from '@/lib/types';

type ResultKind = 'client' | 'devis' | 'rdv';

interface Result {
  kind: ResultKind;
  id: number;
  title: string;
  subtitle: string;
  href: string;
}

const KIND_LABEL: Record<ResultKind, string> = {
  client: 'Prospect',
  devis: 'Devis',
  rdv: 'Rendez-vous',
};

const KIND_COLOR: Record<ResultKind, string> = {
  client: 'var(--accent-sage)',
  devis: 'var(--accent-primary)',
  rdv: 'var(--accent-secondary)',
};

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [rdvList, setRdvList] = useState<RendezVous[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(() => {
    if (loaded || loading) return;
    setLoading(true);
    Promise.all([
      fetchClients().catch(() => []),
      api.get('/devis/').then((r) => r.data).catch(() => []),
      fetchRendezVousList().catch(() => []),
    ]).then(([c, d, r]) => {
      setClients(c);
      setDevisList(d);
      setRdvList(r);
      setLoaded(true);
      setLoading(false);
    });
  }, [loaded, loading]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      loadData();
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open, loadData]);

  const results: Result[] = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: Result[] = [];

    clients.forEach((c) => {
      const hay = `${c.prenom ?? ''} ${c.nom} ${c.entreprise ?? ''} ${c.email}`.toLowerCase();
      if (hay.includes(q)) {
        out.push({
          kind: 'client',
          id: c.id,
          title: `${c.prenom ?? ''} ${c.nom}`.trim(),
          subtitle: c.entreprise || c.email,
          href: `/clients/${c.id}`,
        });
      }
    });

    devisList.forEach((d) => {
      const hay = `${d.client_nom ?? ''} ${d.besoins_client ?? ''}`.toLowerCase();
      if (hay.includes(q)) {
        out.push({
          kind: 'devis',
          id: d.id,
          title: d.client_nom ?? `Devis #${d.id}`,
          subtitle: `#${d.id} · ${d.statut}`,
          href: `/devis/${d.id}`,
        });
      }
    });

    rdvList.forEach((r) => {
      const hay = `${r.client_nom ?? ''} ${r.client_entreprise ?? ''}`.toLowerCase();
      if (hay.includes(q)) {
        out.push({
          kind: 'rdv',
          id: r.id,
          title: r.client_nom ?? `Rendez-vous #${r.id}`,
          subtitle: `${new Date(r.date_rdv).toLocaleDateString('fr-FR')} · ${r.heure_rdv?.slice(0, 5)}`,
          href: `/rendezvous/${r.id}`,
        });
      }
    });

    return out.slice(0, 20);
  })();

  const goTo = (r: Result) => {
    setOpen(false);
    router.push(r.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      goTo(results[activeIndex]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: 'rgba(26,26,46,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--line)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-[var(--ink-soft)] shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un client, un devis, un rendez-vous..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <kbd className="text-[10px] font-mono-num text-[var(--ink-soft)] border border-[var(--line)] rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto app-scroll">
          {loading && (
            <p className="px-5 py-6 text-sm text-[var(--ink-soft)] text-center">Chargement...</p>
          )}
          {!loading && query.trim() && results.length === 0 && (
            <p className="px-5 py-6 text-sm text-[var(--ink-soft)] text-center">Aucun résultat pour &laquo; {query} &raquo;.</p>
          )}
          {!loading && !query.trim() && (
            <p className="px-5 py-6 text-sm text-[var(--ink-soft)] text-center">
              Tapez pour chercher parmi clients, devis et rendez-vous.
            </p>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.kind}-${r.id}`}
              type="button"
              onClick={() => goTo(r)}
              onMouseEnter={() => setActiveIndex(i)}
              className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors"
              style={{ background: i === activeIndex ? 'rgba(108,92,231,0.06)' : 'transparent' }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-1 text-white shrink-0"
                style={{ background: KIND_COLOR[r.kind] }}
              >
                {KIND_LABEL[r.kind]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium truncate">{r.title}</span>
                <span className="block text-xs text-[var(--ink-soft)] truncate">{r.subtitle}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
