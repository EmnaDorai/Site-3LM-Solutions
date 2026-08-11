import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, setToken } from "../../lib/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    if (!username || !password) { setError("Identifiant et mot de passe requis."); return; }
    setLoading(true);
    try {
      const data = await api.login(username, password);
      setToken(data.token);
      router.push("/admin");
    } catch (err) {
      setError("Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="nav">
        <div className="brand"><span className="mark">☎</span>Ligne Directe</div>
        <Link href="/"><button className="btn ghost">← Accueil</button></Link>
      </div>
      <div className="container" style={{ maxWidth: 400 }}>
        <h2 style={{ marginBottom: 6 }}>Connexion administrateur</h2>
        <p className="hint" style={{ marginBottom: 20 }}>
          Réservé à l'équipe commerciale. Utilisez le compte créé via <code>createsuperuser</code>.
        </p>
        <div className="field"><label>Identifiant</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="field"><label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn dark" style={{ width: "100%" }} onClick={handleLogin} disabled={loading}>
          {loading ? "Connexion..." : "Se connecter →"}
        </button>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
