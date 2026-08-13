'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoMark from './LogoMark';

export default function PublicNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark size={36} />
          <div>
            <p className="font-display text-sm font-extrabold tracking-tight leading-tight">3LM SOLUTIONS</p>
            <p className="text-[10px] text-[var(--ink-soft)]">Conseil &amp; solutions digitales</p>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/rendez-vous"
            className="text-sm font-medium transition-colors"
            style={{ color: pathname === '/rendez-vous' ? 'var(--accent-secondary)' : 'var(--ink-soft)' }}
          >
            Prendre rendez-vous
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-full border border-[var(--line)] hover:border-[var(--accent-secondary)] transition-colors"
          >
            Espace équipe
          </Link>
        </nav>
      </div>
    </header>
  );
}
