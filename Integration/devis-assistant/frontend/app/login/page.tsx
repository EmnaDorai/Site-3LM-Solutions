'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/auth';
import LogoMark from '@/components/LogoMark';
import '@/components/site/tokens.css';
import '@/components/site/Auth.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

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
    <div className="site-lm">
      <main className="auth-page">
        <section className="auth-brand-panel">
          <div className="brand-mark">
            <LogoMark size={52} />
            <span>3LM SOLUTIONS</span>
          </div>
          <div>
            <span className="auth-kicker">3LM SOLUTIONS</span>
            <h1>Des solutions digitales pensées avec précision.</h1>
            <p>Retrouvez votre espace de travail : devis, ligne directe et suivi des prospects.</p>
          </div>
        </section>

        <section className="auth-form-panel" aria-labelledby="login-title">
          <div className="auth-form-wrap">
            <span className="auth-kicker">ESPACE ÉQUIPE</span>
            <h2 id="login-title">Bienvenue</h2>
            <p className="auth-intro">Connectez-vous pour accéder à votre espace.</p>

            {error && <div className="auth-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label htmlFor="username">Identifiant</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="votre identifiant"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="auth-options">
                <span>Accès réservé à l&rsquo;équipe 3LM Solutions</span>
              </div>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="auth-footer">
              Vous êtes un visiteur ? <a href="/rendez-vous">Prendre rendez-vous</a>
            </p>
          </div>
        </section>
      </main>
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
