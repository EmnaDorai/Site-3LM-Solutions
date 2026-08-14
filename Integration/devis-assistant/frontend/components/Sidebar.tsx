// Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LogoMark from './LogoMark';
import { clearToken } from '@/lib/auth';

const navGroups = [
  {
    label: 'Vue d\'ensemble',
    items: [
      {
        href: '/dashboard',
        label: 'Tableau de bord',
        match: (p: string) => p === '/dashboard',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Commercial',
    items: [
      {
        href: '/devis',
        label: 'Registre',
        match: (p: string) => p === '/devis' || (p.startsWith('/devis/') && !p.includes('/nouveau')),
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
          </svg>
        ),
      },
      {
        href: '/prospects',
        label: 'Prospects',
        match: (p: string) => p === '/prospects' || p.startsWith('/prospects/'),
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Ligne directe',
    items: [
      {
        href: '/rendezvous',
        label: 'Rendez-vous',
        match: (p: string) => p === '/rendezvous' || (p.startsWith('/rendezvous/') && !p.includes('/nouveau')),
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <aside className="w-64 shrink-0 bg-[var(--surface)] border-r border-[var(--line)] flex flex-col justify-between">
      <div className="flex flex-col min-h-0">
        <Link href="/dashboard" className="px-6 py-6 flex items-center gap-3 border-b border-[var(--line)] shrink-0">
          <LogoMark size={40} />
          <div className="min-w-0">
            <p className="font-display text-sm font-extrabold tracking-tight leading-tight truncate">3LM SOLUTIONS</p>
            <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">Assistant devis &amp; Ligne directe</p>
          </div>
        </Link>

        {/* Recherche rapide */}
        <div className="px-4 pt-4 shrink-0">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="w-full flex items-center gap-2 text-xs text-[var(--ink-soft)] border border-[var(--line)] rounded-lg px-3 py-2.5 hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="flex-1 text-left">Rechercher...</span>
            <kbd className="text-[10px] font-mono-num border border-[var(--line)] rounded px-1.5 py-0.5">⌘K</kbd>
          </button>
        </div>

        {/* Raccourcis de création rapide */}
        <div className="px-4 pt-3 flex gap-2 shrink-0">
          <Link
            href="/devis/nouveau"
            className="btn-press flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white px-3 py-2.5 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
          >
            <span className="text-sm leading-none">+</span> Devis
          </Link>
          <Link
            href="/rendezvous/nouveau"
            className="btn-press flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-lg border border-[var(--line)] transition-colors hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)]"
          >
            <span className="text-sm leading-none">+</span> RDV
          </Link>
        </div>

        <nav className="px-3 py-4 space-y-5 overflow-y-auto app-scroll">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)]/70">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      style={
                        active
                          ? { background: 'rgba(67,97,238,0.08)', color: 'var(--accent-secondary)' }
                          : { color: 'var(--ink-soft)' }
                      }
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(26,26,46,0.035)'; }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full"
                          style={{ backgroundImage: 'linear-gradient(180deg, var(--accent-primary), var(--accent-secondary))' }}
                        />
                      )}
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="px-4 py-4 border-t border-[var(--line)] shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[rgba(26,26,46,0.035)] transition-colors">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
          >
            3L
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate">Équipe 3LM</p>
            <div className="flex items-center gap-1.5">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: 'var(--accent-sage)' }} />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ backgroundColor: 'var(--accent-sage)' }} />
              </span>
              <span className="text-[10px] text-[var(--ink-soft)]">Connecté</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:text-white hover:bg-[var(--accent-brick)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
