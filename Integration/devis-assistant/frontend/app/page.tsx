import Link from 'next/link';
import SiteNavbar from '@/components/site/SiteNavbar';
import SiteFooter from '@/components/site/SiteFooter';
import '@/components/site/tokens.css';
import '@/components/site/Home.css';

const expertises = [
  ['01', 'Intelligence artificielle', 'Agents autonomes, assistants métiers et modèles conçus pour automatiser vos décisions.'],
  ['02', 'Développement web & mobile', 'Plateformes rapides, sécurisées et pensées pour scaler avec votre activité.'],
  ['03', 'Data, ERP & Cloud', 'Infrastructures fiables, données exploitables et processus métiers digitalisés.'],
] as const;

const services = [
  'Intelligence Artificielle', 'Analyse des données', 'IoT', 'DevOps & Cloud',
  'Développement Web', 'Développement Mobile', 'Solutions ERP', 'Community Management',
];

const stack = [
  'React / Next.js', 'Python / Django', 'OpenAI & Gemini', 'PostgreSQL',
  'Docker', 'Kubernetes', 'AWS / GCP', 'Flutter / React Native',
];

export default function Home() {
  return (
    <div className="site-lm">
      <SiteNavbar />
      <main className="home-page">
        <section className="home-hero">
          <div className="hero-bg" aria-hidden="true" />
          <div className="home-hero-copy">
            <span className="hero-badge"><span className="dot" />Studio tech basé à Ariana, Tunisie</span>
            <h1>
              L&rsquo;équipe qui construit vos <span className="gradient-text">produits digitaux</span> et vos <span className="gradient-text">agents IA</span>.
            </h1>
            <p>
              3LM Solutions conçoit et déploie des plateformes web, applications mobiles, agents IA et
              infrastructures cloud pour des entreprises qui veulent avancer vite, sans sacrifier la fiabilité.
            </p>
            <div className="home-actions">
              <Link href="/rendez-vous" className="gradient-button">Réserver un appel découverte →</Link>
              <a href="#expertises" className="light-button">Voir notre expertise</a>
            </div>
          </div>
        </section>

        <div className="tech-strip">
          <span>Technologies que nous maîtrisons au quotidien</span>
          <div className="tech-pills">
            {stack.map((tech) => <em key={tech}>{tech}</em>)}
          </div>
        </div>

        <section className="home-expertise" id="expertises">
          <div className="section-marker"><span />Expertise</div>
          <div className="section-heading">
            <h2>Stratégie, conception et exécution technique — sous un même toit.</h2>
            <p>Une équipe unique pour transformer vos idées en outils numériques fiables et mesurables.</p>
          </div>
          <div className="discipline-grid">
            {expertises.map(([code, title, text]) => (
              <Link href="/rendez-vous" className="discipline-card" key={title}>
                <span className="discipline-code">{code}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="card-link">Découvrir l&rsquo;expertise →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-why" id="methodologie">
          <div className="why-layout">
            <div>
              <div className="section-marker"><span />Pourquoi 3LM</div>
              <h2>Une approche claire, professionnelle et orientée résultats.</h2>
              <p>Nous relions vision business, expérience utilisateur et exécution technique pour livrer des solutions utiles dès le premier jour.</p>
            </div>
            <div className="why-list">
              <article><b>01</b><div><h3>Conseil pragmatique</h3><p>Des recommandations adaptées à vos priorités, vos contraintes et votre budget.</p></div></article>
              <article><b>02</b><div><h3>Solutions sécurisées</h3><p>Une attention constante à la fiabilité, la confidentialité et la maintenance.</p></div></article>
              <article><b>03</b><div><h3>Exécution agile</h3><p>Des cycles courts, des livrables visibles et une communication transparente.</p></div></article>
              <article><b>04</b><div><h3>Accompagnement complet</h3><p>De l&rsquo;idée initiale au déploiement, puis au support et à l&rsquo;évolution.</p></div></article>
            </div>
          </div>
        </section>

        <section className="home-about">
          <div className="about-copy">
            <div className="section-marker"><span />À propos</div>
            <h2>Un partenaire technologique pour vos projets essentiels.</h2>
            <p>Chez 3LM Solutions, nous concevons des outils numériques sur mesure pour aider les entreprises à gagner en performance, automatiser leurs opérations et mieux exploiter leurs données.</p>
            <p>Notre équipe combine savoir-faire technique, sens du service et recherche de résultats mesurables — des solutions modernes, prêtes à accompagner votre croissance.</p>
          </div>
          <div className="home-stats">
            <strong>30+<small>Clients accompagnés</small></strong>
            <strong>85+<small>Projets logiciels livrés</small></strong>
            <strong>7+<small>Pays desservis</small></strong>
          </div>
        </section>

        <section className="home-services">
          <div className="section-marker"><span />Services</div>
          <div className="section-heading">
            <h2>Des compétences digitales réunies dans une même équipe.</h2>
            <p>Chaque service est pensé pour réduire la complexité et donner à vos équipes des outils fiables au quotidien.</p>
          </div>
          <div className="service-links">
            {services.map((label) => (
              <Link href="/rendez-vous" key={label}>{label}<span>↗</span></Link>
            ))}
          </div>
        </section>

        <section className="home-contact-strip">
          <div>
            <div className="section-marker"><span />Entrer en contact</div>
            <h2>Votre prochain projet mérite une base solide.</h2>
            <p>Expliquez-nous votre besoin en 15 minutes et repartez avec une approche claire, chiffrée et réaliste.</p>
          </div>
          <Link href="/rendez-vous" className="gradient-button">Programmer un appel →</Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
