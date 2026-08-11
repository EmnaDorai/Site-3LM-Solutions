import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, clearToken } from "../../lib/api";

const STATUS_LABEL = { en_attente: "En attente", confirme: "Confirmé", annule: "Annulé" };

export default function AdminDashboard() {
  const [rendezVous, setRendezVous] = useState([]);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [editing, setEditing] = useState(null); // id being edited
  const [editValues, setEditValues] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const charger = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statutFilter) params.set("statut", statutFilter);
      const qs = params.toString() ? `?${params}` : "";
      const data = await api.listerRendezVous(qs);
      setRendezVous(data.results || data);
    } catch (err) {
      if (err.message.includes("Informations d'identification") || err.message.includes("valides")) {
        clearToken();
        router.push("/admin/login");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const handleSearch = (e) => { e.preventDefault(); charger(); };

  const startEdit = (rdv) => {
    setEditing(rdv.id);
    setEditValues({ date: rdv.date, heure: rdv.heure.slice(0, 5), statut: rdv.statut });
  };

  const saveEdit = async (id) => {
    try {
      await api.modifierRendezVous(id, editValues);
      setEditing(null);
      charger();
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmer = async (id) => {
    try {
      await api.confirmerRendezVous(id);
      charger();
    } catch (err) {
      setError(err.message);
    }
  };

  const supprimer = async (id) => {
    if (!confirm("Supprimer définitivement ce rendez-vous ?")) return;
    try {
      await api.supprimerRendezVous(id);
      charger();
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => { clearToken(); router.push("/admin/login"); };
const total = rendezVous.length;

const enAttente = rendezVous.filter(
  (r) => r.statut === "en_attente"
).length;

const confirmes = rendezVous.filter(
  (r) => r.statut === "confirme"
).length;

const annules = rendezVous.filter(
  (r) => r.statut === "annule"
).length;
  return (
    <div>
      <div className="nav">
        <div className="brand"><span className="mark">☎</span>Ligne Directe — Admin</div>
        <div style={{ display: "flex", gap: 10 }}>

    <Link href="/">
        <button className="btn ghost">
            Accueil
        </button>
    </Link>

    
    <button className="btn ghost" onClick={logout}>
        Déconnexion
    </button>

</div>
      </div>

      <div className="container">
        <h2 style={{ marginBottom: 20 }}>Tableau de bord des rendez-vous</h2>
        <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
    gap: 20,
    marginBottom: 30,
  }}
>
  <div
    style={{
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,.08)",
    }}
  >
    <h4>Total des rendez-vous</h4>
    <h2>{total}</h2>
  </div>

  <div
    style={{
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,.08)",
    }}
  >
    <h4>En attente</h4>
    <h2>{enAttente}</h2>
  </div>

  <div
    style={{
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,.08)",
    }}
  >
    <h4>Confirmés</h4>
    <h2>{confirmes}</h2>
  </div>

  <div
    style={{
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,.08)",
    }}
  >
    <h4>Annulés</h4>
    <h2>{annules}</h2>
  </div>
</div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            placeholder="Rechercher un prospect (nom, email, entreprise, téléphone)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8 }}
          />
          <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}
                  style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8 }}>
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="confirme">Confirmé</option>
            <option value="annule">Annulé</option>
          </select>
          <button className="btn dark" type="submit">Rechercher</button>
        </form>

        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}
        {loading ? <p>Chargement...</p> : (
          <table>
            <thead>
              <tr>
                <th>Prospect</th><th>Entreprise</th><th>Contact</th><th>Date</th><th>Heure</th><th>Statut</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rendezVous.map((rdv) => (
                <tr key={rdv.id}>
                  <td><strong>{rdv.prospect.prenom} {rdv.prospect.nom}</strong></td>
                  <td>{rdv.prospect.entreprise || "—"}</td>
                  <td style={{ fontSize: "0.8rem" }}>{rdv.prospect.email}<br />{rdv.prospect.telephone}</td>

                  {editing === rdv.id ? (
                    <>
                      <td><input type="date" value={editValues.date} onChange={(e) => setEditValues({ ...editValues, date: e.target.value })} /></td>
                      <td><input type="time" value={editValues.heure} onChange={(e) => setEditValues({ ...editValues, heure: e.target.value })} /></td>
                      <td>
                        <select value={editValues.statut} onChange={(e) => setEditValues({ ...editValues, statut: e.target.value })}>
                          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <button className="btn" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => saveEdit(rdv.id)}>Enregistrer</button>
                        <button className="btn ghost" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => setEditing(null)}>Annuler</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{rdv.date}</td>
                      <td>{rdv.heure.slice(0, 5)}</td>
                      <td><span className={"badge " + rdv.statut}>{STATUS_LABEL[rdv.statut]}</span></td>
                      <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {rdv.statut !== "confirme" && (
                          <button className="btn" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => confirmer(rdv.id)}>Confirmer</button>
                        )}
                        <button className="btn ghost" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => startEdit(rdv)}>Modifier</button>
                        <button className="btn ghost" style={{ padding: "6px 12px", fontSize: "0.8rem", color: "var(--red)" }} onClick={() => supprimer(rdv.id)}>Supprimer</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {rendezVous.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)" }}>Aucun rendez-vous trouvé.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
