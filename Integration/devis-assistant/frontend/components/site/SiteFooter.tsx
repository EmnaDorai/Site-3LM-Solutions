import Link from 'next/link';
import './Footer.css';

export default function SiteFooter() {
  return (
    <footer id="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-brand-name">3LM <span>Solutions</span></span>
            <p>Votre partenaire informatique fiable, rapide et efficace. Solutions informatiques professionnelles pour particuliers et entreprises.</p>
            <div className="socials">
              <a href="#" className="social">in</a>
              <a href="#" className="social">f</a>
              <a href="#" className="social">𝕏</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><Link href="/#expertises">Intelligence Artificielle</Link></li>
              <li><Link href="/#expertises">Analyses des données</Link></li>
              <li><Link href="/#expertises">IoT</Link></li>
              <li><Link href="/#expertises">DevOps</Link></li>
              <li><Link href="/#expertises">Développement Web</Link></li>
              <li><Link href="/#expertises">Développement Mobile</Link></li>
              <li><Link href="/#expertises">ERP</Link></li>
              <li><Link href="/#expertises">Community management</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Liens</h4>
            <ul>
              <li><Link href="/">Accueil</Link></li>
              <li><Link href="/rendez-vous">Prendre rendez-vous</Link></li>
              <li><Link href="/login">Espace équipe</Link></li>
              <li><a href="#footer">Contactez-nous</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <div className="footer-contact-item">📍 Ariana, Tunisie</div>
            <div className="footer-contact-item">📞 <a href="tel:+21654507574">+216 54 507 574</a></div>
            <div className="footer-contact-item">✉️ <a href="mailto:contact@3lmsolutions.net">contact@3lmsolutions.net</a></div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Copyright © 3LM Solutions</span>
          <span>Ariana, Tunisie</span>
        </div>
      </div>
    </footer>
  );
}
