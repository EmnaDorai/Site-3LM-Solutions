'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/devis', label: 'Registre', match: (p: string) => p === '/devis' || (p.startsWith('/devis/') && !p.includes('/nouveau')) },
  { href: '/devis/nouveau', label: 'Nouveau devis', match: (p: string) => p === '/devis/nouveau' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-[var(--surface)] border-r border-[var(--line)] flex flex-col justify-between">
      <div>
        <div className="px-6 py-7 flex items-center gap-3">
          <Image src="/logo-3lm.png" alt="3LM Solutions" width={40} height={40} className="rounded-lg shrink-0" />
          <div>
            <p className="font-display text-base leading-tight">3LM Solutions</p>
            <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">assistant devis</p>
          </div>
        </div>
        <nav className="px-3 py-2 space-y-1.5">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={active ? { background: 'var(--accent-primary)', color: '#fff' } : { color: 'var(--ink-soft)' }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-6 py-5 border-t border-[var(--line)] space-y-3">
        <Link href="/" className="block text-xs text-[var(--ink-soft)] hover:text-[var(--accent-secondary)] transition-colors">
          ← Retour au site
        </Link>
        <div className="flex items-center gap-2 rounded-full px-3 py-1.5 w-fit" style={{ background: '#E9F9EF' }}>
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: 'var(--accent-sage)' }} />
            <span className="relative inline-flex rounded-full w-2 h-2" style={{ backgroundColor: 'var(--accent-sage)' }} />
          </span>
          <span className="text-[11px] font-medium" style={{ color: 'var(--accent-sage)' }}>Prêt</span>
        </div>
      </div>
    </aside>
  );
}
