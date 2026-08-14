'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import { TYPE_RDV_CONFIG } from '@/lib/statusRdv';
import '@/components/site/tokens.css';
import '@/components/site/Booking.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const TRUST_POINTS = [
  'Réponse et confirmation sous 24h ouvrées',
  'Échange avec un expert, pas un commercial générique',
  'Devis personnalisé et chiffré après l’appel',
  'Vos informations restent confidentielles',
];

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
      <div className="site-lm">
        <SiteNavbar />
        <div className="booking-success">
          <div className="booking-success-card">
            <div className="booking-success-icon">✓</div>
            <h1>Demande envoyée !</h1>
            <p>
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
    <div className="site-lm">
      <SiteNavbar />
      <div className="booking-page">
        <div className="booking-bg" aria-hidden="true" />
        <div className="booking-layout">
          <div className="booking-intro">
            <span className="hero-badge"><span className="dot" />Ligne directe</span>
            <h1>Parlons de votre <span className="gradient-text">projet</span>.</h1>
            <p>
              Choisissez un créneau et décrivez brièvement votre besoin — un expert 3LM Solutions vous
              recontacte pour cadrer le projet avant de vous proposer un devis.
            </p>
            <ul className="booking-points">
              {TRUST_POINTS.map((point) => (
                <li key={point}>
                  <span className="check">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="booking-card">
            <div className="booking-grid-2">
              <div className="field-group">
                <label htmlFor="prenom">Prénom</label>
                <input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Amine" required />
              </div>
              <div className="field-group">
                <label htmlFor="nom">Nom</label>
                <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ben Salah" required />
              </div>
            </div>

            <div className="booking-grid-2">
              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@entreprise.com" required />
              </div>
              <div className="field-group">
                <label htmlFor="telephone">Téléphone</label>
                <input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+216 ..." required />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="entreprise">Entreprise (facultatif)</label>
              <input id="entreprise" value={entreprise} onChange={(e) => setEntreprise(e.target.value)} placeholder="Nom de votre entreprise" />
            </div>

            <div className="booking-grid-2">
              <div className="field-group">
                <label htmlFor="date_rdv">Date souhaitée</label>
                <input id="date_rdv" type="date" value={dateRdv} onChange={(e) => setDateRdv(e.target.value)} required />
              </div>
              <div className="field-group">
                <label htmlFor="heure_rdv">Heure souhaitée</label>
                <input id="heure_rdv" type="time" value={heureRdv} onChange={(e) => setHeureRdv(e.target.value)} required />
                {dateRdv && creneauxPris.length > 0 && (
                  <p className="booking-slot-hint">Déjà pris ce jour-là : {creneauxPris.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="field-group">
              <label>Type de rendez-vous</label>
              <div className="booking-type-row">
                {Object.entries(TYPE_RDV_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTypeRdv(key)}
                    className={`booking-type-btn ${typeRdv === key ? 'active' : ''}`}
                  >
                    {cfg.icon} {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="message">Votre besoin (facultatif)</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Décrivez brièvement votre projet ou votre besoin..."
              />
            </div>

            {error && <p className="booking-error">{error}</p>}

            <button type="submit" disabled={loading} className="booking-submit">
              {loading ? 'Envoi en cours...' : 'Demander ce rendez-vous'}
            </button>
          </form>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
