'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/auth';
import LogoMark from '@/components/LogoMark';
import PublicNav from '@/components/PublicNav';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/devis';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      router.push(next);
    } catch {
      setError('Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <LogoMark size={52} />
          <p className="font-display text-lg font-extrabold tracking-tight mt-3">3LM SOLUTIONS</p>
          <p className="text-xs text-[var(--ink-soft)] mt-1">Espace administrateur</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 shadow-md">
          <div>
            <label htmlFor="username" className="text-xs text-[var(--ink-soft)] block mb-1.5">Identifiant</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs text-[var(--ink-soft)] block mb-1.5">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors"
            />
          </div>

          {error && <p className="text-sm text-[var(--accent-brick)]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
