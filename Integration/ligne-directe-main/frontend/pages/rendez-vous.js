import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";

function businessDays(count = 5) {
  const days = [];
  const today = new Date();
  for (let i = 1, added = 0; added < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      days.push(d);
      added++;
    }
  }
  return days;
}

const SLOT_TIMES = ["09:00", "10:30", "14:00", "15:30", "17:00", "18:30"];
const DAY_NAMES = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}
function fmtDay(d) {
  return d.getDate() + " " + d.toLocaleDateString("fr-FR", { month: "short" });
}

export default function RendezVous() {
  const [days] = useState(businessDays());
  const [dayIndex, setDayIndex] = useState(0);
  const [time, setTime] = useState(null);
  const [taken, setTaken] = useState([]);
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", telephone: "", entreprise: "", message: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    setTime(null);
    api.creneauxPris(toISODate(days[dayIndex]))
      .then((data) => setTaken(data.creneaux_pris || []))
      .catch(() => setTaken([]));
  }, [dayIndex]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    if (!time) { setError("Veuillez choisir un créneau."); return; }
    if (!form.prenom || !form.nom || !form.email || !form.telephone) {
      setError("Veuillez renseigner prénom, nom, email et téléphone.");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, date: toISODate(days[dayIndex]), heure: time };
      const result = await api.creerRendezVous(payload);
      setConfirmed(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div>
        <div className="nav"><div className="brand"><span className="mark">☎</span>Ligne Directe</div><Link href="/"><button className="btn ghost">← Accueil</button></Link></div>
        <div className="container" style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--teal-ok)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "1.4rem" }}>✓</div>
          <h2>Rendez-vous confirmé</h2>
          <p>
            {form.prenom}, votre appel est fixé le {fmtDay(days[dayIndex])} à {time}.
            {confirmed.email_envoye ? " Un email de confirmation vient de vous être envoyé." : " (l'email n'a pas pu être envoyé — vérifiez la configuration SMTP)"}
          </p>
          <button className="btn" onClick={() => setConfirmed(null)}>Prendre un autre rendez-vous</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="nav">
        <div className="brand"><span className="mark">☎</span>Ligne Directe</div>
        <Link href="/"><button className="btn ghost">← Accueil</button></Link>
      </div>
      <div className="container">
        <h2 style={{ marginBottom: 24 }}>Prendre rendez-vous</h2>

        <div className="field"><label>Jour</label>
          <div className="days">
            {days.map((d, i) => (
              <div key={i} className={"day" + (i === dayIndex ? " sel" : "")} onClick={() => setDayIndex(i)}>
                <div style={{ fontSize: "0.7rem" }}>{DAY_NAMES[d.getDay()]}</div>
                <div style={{ fontWeight: 700 }}>{fmtDay(d)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="field"><label>Créneau horaire</label>
          <div className="slots">
            {SLOT_TIMES.map((t) => {
              const isTaken = taken.includes(t + ":00") || taken.includes(t);
              return (
                <div key={t} className={"slot" + (isTaken ? " taken" : "") + (time === t ? " sel" : "")}
                     onClick={() => !isTaken && setTime(t)}>{t}</div>
              );
            })}
          </div>
        </div>

        <div className="row2">
          <div className="field"><label>Prénom</label><input name="prenom" value={form.prenom} onChange={handleChange} /></div>
          <div className="field"><label>Nom</label><input name="nom" value={form.nom} onChange={handleChange} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>Email professionnel</label><input name="email" value={form.email} onChange={handleChange} /></div>
          <div className="field"><label>Téléphone</label><input name="telephone" value={form.telephone} onChange={handleChange} /></div>
        </div>
        <div className="field"><label>Entreprise</label><input name="entreprise" value={form.entreprise} onChange={handleChange} /></div>
        <div className="field"><label>Message (optionnel)</label><textarea name="message" rows={3} value={form.message} onChange={handleChange} /></div>

        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Envoi en cours..." : "Confirmer le rendez-vous →"}
        </button>
        {error && <div className="error">{error}</div>}
        <div className="hint" style={{ marginTop: 8 }}>Un email de confirmation automatique vous sera envoyé instantanément.</div>
      </div>
    </div>
  );
}
