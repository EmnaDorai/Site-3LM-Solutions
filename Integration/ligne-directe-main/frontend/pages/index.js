import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="nav">
        <div className="brand"><span className="mark">☎</span>Ligne Directe</div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/rendez-vous"><button className="btn">Prendre rendez-vous</button></Link>
          <Link href="/devis"><button className="btn ghost">Espace devis</button></Link>
          <Link href="/admin/login"><button className="btn ghost">Administration</button></Link>
        </div>
      </div>

      <div className="container" style={{ textAlign: "center", paddingTop: "8vw" }}>
        <h1 style={{ fontSize: "2.6rem", marginBottom: 16 }}>
          Réservez un rendez-vous téléphonique avec un commercial
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: 560, margin: "0 auto 30px" }}>
          Formulaire prospect, choix de créneau, confirmation automatique par email
          et gestion centralisée côté administrateur.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <Link href="/rendez-vous"><button className="btn">Espace visiteur →</button></Link>
          <Link href="/admin/login"><button className="btn dark">Espace administrateur →</button></Link>
        </div>
      </div>
    </div>
  );
}
