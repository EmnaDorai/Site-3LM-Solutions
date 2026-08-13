'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import PublicNav from '@/components/PublicNav';
import LogoMark from '@/components/LogoMark';
import { TYPE_RDV_CONFIG } from '@/lib/statusRdv';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export default function RendezVousPublicPage() {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [message, setMessage] = useState('');
  const [dateRdv, setDateRdv] = useState('');
  const [heureRdv, setHeureRdv] = useState('');
  const [typeRdv, setTypeRdv] = useState('appel');

  const [creneauxPris, setCreneauxPris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ emailEnvoye: boolean } | null>(null);

  useEffect(() => {
    if (!dateRdv) {
      setCreneauxPris([]);
      return;
    }
    axios
      .get(`${API_URL}/rendezvous/creneaux/?date=${dateRdv}`)
      .then((res) => setCreneauxPris(res.data.creneaux_pris || []))
      .catch(() => setCreneauxPris([]));
  }, [dateRdv]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/rendezvous/public/`, {
        prenom,
        nom,
        email,
        telephone,
        entreprise,
        message,
        date_rdv: dateRdv,
        heure_rdv: heureRdv,
        type_rdv: typeRdv,
      });
      setSuccess({ emailEnvoye: res.data.email_envoye });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        const msg = typeof data === 'object' ? Object.values(data).flat().join(' ') : String(data);
        setError(msg || "Erreur lors de l'envoi de votre demande.");
      } else {
        setError("Erreur lors de l'envoi de votre demande.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNav />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex justify-center">
              <LogoMark size={56} />
            </div>
            <h1 className="font-display text-2xl font-extrabold mb-3">Demande envoyée !</h1>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
              Merci {prenom}, nous avons bien reçu votre demande de rendez-vous.
              {success.emailEnvoye
                ? ' Un email de confirmation vient de vous être envoyé.'
                : ' Notre équipe vous recontactera pour confirmer ce créneau.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <div className="flex-1 px-4 py-12 flex justify-center">
        <div className="w-full max-w-xl">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent-secondary)' }}>
              Ligne directe
            </p>
            <h1 className="font-display text-2xl font-extrabold tracking-tight">Prendre rendez-vous</h1>
            <p className="text-sm text-[var(--ink-soft)] mt-2">Un membre de notre équipe vous recontactera au créneau choisi.</p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-5 shadow-md">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="text-xs text-[var(--ink-soft)] block mb-1.5">Prénom</label>
                <input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors" />
              </div>
              <div>
                <label htmlFor="nom" className="text-xs text-[var(--ink-soft)] block mb-1.5">Nom</label>
                <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="text-xs text-[var(--ink-soft)] block mb-1.5">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors" />
              </div>
              <div>
                <label htmlFor="telephone" className="text-xs text-[var(--ink-soft)] block mb-1.5">Téléphone</label>
                <input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} required
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors" />
              </div>
            </div>

            <div>
              <label htmlFor="entreprise" className="text-xs text-[var(--ink-soft)] block mb-1.5">Entreprise (facultatif)</label>
              <input id="entreprise" value={entreprise} onChange={(e) => setEntreprise(e.target.value)}
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date_rdv" className="text-xs text-[var(--ink-soft)] block mb-1.5">Date souhaitée</label>
                <input id="date_rdv" type="date" value={dateRdv} onChange={(e) => setDateRdv(e.target.value)} required
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors" />
              </div>
              <div>
                <label htmlFor="heure_rdv" className="text-xs text-[var(--ink-soft)] block mb-1.5">Heure souhaitée</label>
                <input id="heure_rdv" type="time" value={heureRdv} onChange={(e) => setHeureRdv(e.target.value)} required
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-secondary)] transition-colors" />
                {dateRdv && creneauxPris.length > 0 && (
                  <p className="text-[11px] text-[var(--accent-brick)] mt-1.5">
                    Déjà pris ce jour-là : {creneauxPris.join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--ink-soft)] block mb-2">Type de rendez-vous</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(TYPE_RDV_CONFIG).map(([key, cfg]) => {
                  const active = typeRdv === key;
                  return (
                    <button key={key} type="button" onClick={() => setTypeRdv(key)}
                      className="text-sm rounded-full border px-4 py-2 transition-all duration-200 flex items-center gap-1.5"
                      style={active
                        ? { backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))', color: '#fff', borderColor: 'transparent' }
                        : { borderColor: 'var(--line)' }}>
                      <span>{cfg.icon}</span>{cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="text-xs text-[var(--ink-soft)] block mb-1.5">Votre besoin (facultatif)</label>
              <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                placeholder="Décrivez brièvement votre projet ou votre besoin..."
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm outline-none resize-none leading-relaxed transition-colors focus:border-[var(--accent-secondary)]" />
            </div>

            {error && <p className="text-sm text-[var(--accent-brick)]">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full text-white py-3.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))' }}>
              {loading ? 'Envoi en cours...' : 'Demander ce rendez-vous'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
