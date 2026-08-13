import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import LogoMark from '@/components/LogoMark';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <LogoMark size={64} />
          </div>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--accent-secondary)' }}>
            3LM Solutions
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
            Conseil &amp; solutions digitales sur mesure
          </h1>
          <p className="text-[var(--ink-soft)] text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Décrivez-nous votre projet, nous vous recontactons rapidement pour en discuter et vous
            proposer un devis adapté à vos besoins.
          </p>
          <Link
            href="/rendez-vous"
            className="inline-flex items-center gap-2 text-white px-7 py-3.5 rounded-full text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
          >
            Prendre rendez-vous
          </Link>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-20 grid sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-semibold mb-2">Échangeons sur votre projet</h2>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
              Choisissez un créneau qui vous convient — par téléphone, en visio ou sur site — pour
              présenter votre besoin à notre équipe commerciale.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-semibold mb-2">Un devis rapide et clair</h2>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
              Suite à notre échange, vous recevez un devis détaillé par email, chiffré et adapté
              précisément à votre besoin.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] py-6 text-center text-xs text-[var(--ink-soft)]">
        © {new Date().getFullYear()} 3LM Solutions — Tous droits réservés.
      </footer>
    </div>
  );
}
