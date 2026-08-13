// Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LogoMark from './LogoMark';
import { clearToken } from '@/lib/auth';

const navItems = [
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
    href: '/devis/nouveau',
    label: 'Nouveau devis',
    match: (p: string) => p === '/devis/nouveau',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    href: '/rendezvous',
    label: 'Ligne directe',
    match: (p: string) => p === '/rendezvous' || (p.startsWith('/rendezvous/') && !p.includes('/nouveau')),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
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
      <div>
        <div className="px-6 py-6 flex items-center gap-3 border-b border-[var(--line)]">
          <LogoMark size={40} />
          <div className="min-w-0">
            <p className="font-display text-sm font-extrabold tracking-tight leading-tight truncate">3LM SOLUTIONS</p>
            <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">Assistant devis &amp; Ligne directe</p>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={
                  active
                    ? { backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: '#fff' }
                    : { color: 'var(--ink-soft)' }
                }
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-6 py-5 border-t border-[var(--line)]">
        <p className="text-[11px] text-[var(--ink-soft)] mb-2">v0.4 — assistant IA + ligne directe</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5 w-fit" style={{ background: '#E9F9EF' }}>
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: 'var(--accent-sage)' }} />
              <span className="relative inline-flex rounded-full w-2 h-2" style={{ backgroundColor: 'var(--accent-sage)' }} />
            </span>
            <span className="text-[11px] font-medium" style={{ color: 'var(--accent-sage)' }}>Prêt</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] font-medium text-[var(--ink-soft)] hover:text-[var(--accent-brick)] transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}
