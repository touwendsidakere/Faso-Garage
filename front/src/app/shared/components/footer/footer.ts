import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-col footer-brand">
          <a routerLink="/" class="logo">
            <img src="/logo.png" alt="Faso Garages" class="logo-img">
          </a>
          <p class="tagline">
            La plateforme qui géolocalise et connecte les professionnels de l'automobile
            au Burkina Faso : garages, dépanneurs, stations, assurances et carrosseries.
          </p>
          <div class="socials">
            <a href="#" target="_blank" rel="noopener" aria-label="Facebook"><i class="ti ti-brand-facebook"></i></a>
            <a href="#" target="_blank" rel="noopener" aria-label="Instagram"><i class="ti ti-brand-instagram"></i></a>
            <a href="#" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="ti ti-brand-whatsapp"></i></a>
            <a href="#" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="ti ti-brand-linkedin"></i></a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Liens rapides</h4>
          <nav>
            <a routerLink="/">Accueil</a>
            <a routerLink="/carte">Carte</a>
            <a routerLink="/numeros-utiles">Numéros utiles</a>
            <a routerLink="/astuces">Astuces</a>
          </nav>
        </div>

        <div class="footer-col">
          <h4>Espace pro</h4>
          <nav>
            <a routerLink="/inscription-pro">Devenir partenaire</a>
            <a routerLink="/inscription">Créer un compte</a>
            <a routerLink="/connexion">Connexion</a>
          </nav>
        </div>

        <div class="footer-col">
          <h4>Contact</h4>
          <ul class="contacts">
            <li>
              <i class="ti ti-map-pin"></i>
              <span>Ouagadougou, Burkina Faso</span>
            </li>
            <li>
              <i class="ti ti-phone"></i>
              <a href="tel:+22660089494">+226 60 08 94 94</a>
            </li>
            <li>
              <i class="ti ti-mail"></i>
              <a href="mailto:contact@fasogarage.bf">contact&#64;fasogarage.bf</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Faso Garages. Tous droits réservés.</p>
        <p class="signature">
          Une solution
          <a href="https://www.smartprest.net" target="_blank" rel="noopener">Smartprest</a>
        </p>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }

    .footer {
      background: var(--fg-text);
      color: #d8dbdf;
      margin-top: auto;
    }

    .footer-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 56px 24px 32px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.3fr;
      gap: 40px;
    }

    .footer-col h4 {
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
      margin: 0 0 18px;
    }

    .footer-col nav, .contacts {
      display: flex;
      flex-direction: column;
      gap: 12px;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-col nav a, .contacts a, .contacts span {
      color: #b7bbc2;
      text-decoration: none;
      font-size: 14px;
      transition: color .2s;
    }

    .footer-col nav a:hover, .contacts a:hover {
      color: var(--fg-green-light);
    }

    .contacts li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14px;

      i {
        color: var(--fg-green-light);
        font-size: 17px;
        margin-top: 1px;
      }
    }

    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      width: fit-content;
    }

    .logo-img {
      height: 38px;
      width: auto;
      display: block;
    }

    .tagline {
      font-size: 13.5px;
      line-height: 1.7;
      color: #9ca0a8;
      max-width: 360px;
      margin: 0;
    }

    .socials {
      display: flex;
      gap: 10px;
    }

    .socials a {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,.08);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      text-decoration: none;
      font-size: 16px;
      transition: background .2s, color .2s;

      &:hover {
        background: var(--fg-green);
        color: #fff;
      }
    }

    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,.1);
      padding: 18px 24px;
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;

      p {
        margin: 0;
        font-size: 13px;
        color: #9ca0a8;
      }

      .signature a {
        color: var(--fg-green-light);
        text-decoration: none;
        font-weight: 600;

        &:hover { text-decoration: underline; }
      }
    }

    @media (max-width: 900px) {
      .footer-inner {
        grid-template-columns: 1fr 1fr;
      }
      .footer-brand { grid-column: 1 / -1; }
    }

    @media (max-width: 560px) {
      .footer-inner { grid-template-columns: 1fr; }
      .footer-bottom { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class Footer {
  currentYear = new Date().getFullYear();
}
