'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoMark from '@/components/LogoMark';
import './Navbar.css';

export default function SiteNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const active = (p: string) => pathname === p;

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-wrap">
        <Link href="/" className="brand" aria-label="3LM Solutions, accueil">
          <LogoMark size={42} className="brand-logo" />
          <span>
            <strong>3LM SOLUTIONS</strong>
            <small>Conseil &amp; solutions digitales</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Navigation principale">
          <Link className={active('/') ? 'active' : ''} href="/">Accueil</Link>
          <Link href="/#expertises">Services</Link>
        </nav>

        <div className="nav-actions">
          <Link href="/rendez-vous" className="nav-appointment">Prenez un rendez-vous</Link>
          <Link href="/login" className="nav-team">Espace équipe</Link>
        </div>

        <button
          className="nav-toggle"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? '×' : '☰'}
        </button>
      </div>

      {open && (
        <nav className="mobile-nav" aria-label="Navigation mobile">
          <Link href="/">Accueil</Link>
          <Link href="/#expertises">Services</Link>
          <Link href="/rendez-vous" className="nav-appointment">Prenez un rendez-vous</Link>
          <Link href="/login" className="nav-team">Espace équipe</Link>
        </nav>
      )}
    </header>
  );
}
