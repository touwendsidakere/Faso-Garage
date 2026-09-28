import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="forbidden-card">
        <div class="icon">
          <i class="ti ti-lock-off"></i>
        </div>
        <h1>Accès refusé</h1>
        <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
        <a routerLink="/" class="btn-home">
          <i class="ti ti-home"></i>
          Retour à l'accueil
        </a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }

    .page {
      min-height: 100vh;
      background: var(--fg-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
    }

    .forbidden-card {
      background: #fff;
      border-radius: 24px;
      padding: 60px 40px;
      text-align: center;
      max-width: 500px;
      box-shadow: var(--fg-shadow-md);
    }

    .icon {
      width: 80px;
      height: 80px;
      background: var(--fg-red-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;

      i {
        font-size: 40px;
        color: var(--fg-red);
      }
    }

    h1 {
      font-size: 28px;
      font-weight: 800;
      color: var(--fg-text);
      margin: 0 0 12px;
    }

    p {
      font-size: 14px;
      color: var(--fg-text-secondary);
      line-height: 1.6;
      margin: 0 0 32px;
    }

    .btn-home {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--fg-green);
      color: #fff;
      padding: 14px 28px;
      border-radius: 10px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      transition: background .2s;

      i { font-size: 18px; }

      &:hover { background: var(--fg-green-dark); }
    }
  `],
})
export class Forbidden {}