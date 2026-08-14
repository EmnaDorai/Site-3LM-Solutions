'use client';

import { useMemo, useState } from 'react';
import { Client } from '@/lib/types';

interface ClientPickerProps {
  clients: Client[];
  loading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  /** Quand le client est déjà imposé (ex. lien depuis une fiche client), on affiche juste sa carte, non modifiable. */
  locked?: boolean;
}

function matches(client: Client, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    client.nom.toLowerCase().includes(q) ||
    (client.prenom ?? '').toLowerCase().includes(q) ||
    (client.entreprise ?? '').toLowerCase().includes(q) ||
    client.email.toLowerCase().includes(q) ||
    client.telephone.toLowerCase().includes(q)
  );
}

export default function ClientPicker({ clients, loading, selectedId, onSelect, locked }: ClientPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selectedClient = clients.find((c) => String(c.id) === selectedId);

  const filtered = useMemo(() => {
    if (!query) return clients;
    return clients.filter((c) => matches(c, query));
  }, [clients, query]);

  if (loading) {
    return <p className="text-sm text-[var(--ink-soft)]">Chargement des clients...</p>;
  }

  if (clients.length === 0) {
    return <p className="text-sm text-[var(--ink-soft)]">Aucun client disponible.</p>;
  }

  // Client déjà sélectionné (et pas en train de le changer) : carte compacte + bouton pour rouvrir la recherche.
  if (selectedClient && !open) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-transparent bg-[var(--surface)] p-4 shadow-md"
        style={{
          backgroundImage: 'linear-gradient(var(--surface), var(--surface)), linear-gradient(135deg, var(--accent-primary, var(--accent-secondary)), var(--accent-secondary))',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{selectedClient.nom} {selectedClient.prenom}</p>
          {selectedClient.entreprise && <p className="text-xs text-[var(--ink-soft)] mt-0.5 truncate">{selectedClient.entreprise}</p>}
          <p className="text-xs text-[var(--ink-soft)] font-mono-num mt-1 truncate">{selectedClient.email}</p>
        </div>
        {!locked && (
          <button
            type="button"
            onClick={() => { setOpen(true); setQuery(''); }}
            className="shrink-0 text-xs font-semibold rounded-full px-3.5 py-2 border border-[var(--line)] hover:border-[var(--accent-secondary)] transition-colors"
          >
            Changer
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-2">
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Rechercher parmi ${clients.length} clients (nom, entreprise, email...)`}
          className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--ink-soft)] px-1 py-3">Aucun client ne correspond à &laquo;&nbsp;{query}&nbsp;&raquo;.</p>
      ) : (
        <div className="max-h-72 overflow-y-auto rounded-lg border border-[var(--line)] divide-y divide-[var(--line)] assistant-scroll">
          {filtered.map((c) => {
            const selected = String(c.id) === selectedId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => { onSelect(String(c.id)); setOpen(false); }}
                className="w-full flex items-center justify-between gap-3 text-left px-4 py-3 transition-colors"
                style={{ background: selected ? 'rgba(67,97,238,0.06)' : 'transparent' }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(67,97,238,0.04)'; }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{c.nom} {c.prenom}</p>
                  <p className="text-xs text-[var(--ink-soft)] truncate">
                    {c.entreprise ? `${c.entreprise} · ` : ''}{c.email}
                  </p>
                </div>
                {selected && (
                  <span className="shrink-0 text-[var(--accent-secondary)] text-sm">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {filtered.length > 0 && (
        <p className="text-[11px] text-[var(--ink-soft)] mt-1.5 font-mono-num">
          {filtered.length} client{filtered.length > 1 ? 's' : ''} {query ? 'trouvé' + (filtered.length > 1 ? 's' : '') : 'au total'}
        </p>
      )}
    </div>
  );
}
