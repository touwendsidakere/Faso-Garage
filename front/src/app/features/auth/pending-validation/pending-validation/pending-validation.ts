import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-pending-validation',
  standalone: true,
  template: `
    <div class="page">

      <div class="screen-header">
        <div class="logo-row">
          <div class="logo-pin">
            <svg viewBox="0 0 18 18" fill="none">
              <path d="M9 1C5.686 1 3 3.686 3 7c0 4.5 6 10 6 10S15 11.5 15 7c0-3.314-2.686-6-6-6z" fill="#289a4f"/>
              <circle cx="9" cy="7" r="2.5" fill="#fff"/>
            </svg>
          </div>
          <div>
            <div class="logo-text-faso">Faso Garages</div>
            <div class="logo-text-sub">Espace Pro</div>
          </div>
        </div>
      </div>

      <div class="screen-body">

        <div class="status-icon">
          <i class="ti ti-clock-hour-4"></i>
        </div>

        <div class="status-title">Demande envoyée !<br>En attente de validation 🕐</div>
        <div class="status-sub">Notre équipe examine votre dossier.<br>Vous recevrez une confirmation par email.</div>

        <div class="steps-list">
          <div class="step-row done">
            <div class="step-num done"><i class="ti ti-check"></i></div>
            <div class="step-info">
              <p>Inscription soumise</p>
              <small>Dossier reçu par notre équipe</small>
            </div>
            <span class="step-badge badge-done">Fait</span>
          </div>

          <div class="step-row active">
            <div class="step-num active">2</div>
            <div class="step-info">
              <p>Vérification du dossier</p>
              <small>En cours par l'équipe admin</small>
            </div>
            <span class="step-badge badge-active">En cours</span>
          </div>

          <div class="step-row">
            <div class="step-num todo">3</div>
            <div class="step-info">
              <p>Compte activé</p>
              <small>Visible sur la carte</small>
            </div>
            <span class="step-badge badge-todo">À venir</span>
          </div>
        </div>

        <div class="info-banner">
          <i class="ti ti-mail"></i>
          <p>Un email de confirmation vous sera envoyé à
            <strong>{{ email }}</strong>
            dès la validation de votre compte.
          </p>
        </div>

        <button class="btn-logout" (click)="auth.logout()">
          Se déconnecter
        </button>

      </div>
    </div>
  `,
  styles: [`
    .page {
      font-family: 'Poppins', sans-serif;
      min-height: 100vh;
      background: #f7f8fa;
      display: flex;
      flex-direction: column;
    }

    .screen-header {
      background: #289a4f;
      padding: 52px 24px 24px;
      border-radius: 0 0 28px 28px;
      display: flex; align-items: center; justify-content: center;
    }

    .logo-row { display: flex; align-items: center; gap: 10px; }

    .logo-pin {
      width: 32px; height: 32px; background: #f1e23c;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      svg { width: 18px; height: 18px; }
    }

    .logo-text-faso { font-size: 18px; font-weight: 800; color: #fff; }
    .logo-text-sub { font-size: 10px; font-weight: 700; color: #f1e23c; letter-spacing: 2px; text-transform: uppercase; }

    .screen-body {
      flex: 1;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 32px 24px;
      gap: 16px;
      max-width: 480px;
      width: 100%;
      margin: 0 auto;
    }

    .status-icon {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: #fff8e1;
      border: 3px solid #f1e23c;
      display: flex; align-items: center; justify-content: center;
      i { font-size: 38px; color: #c92946; }
    }

    .status-title {
      font-size: 16px; font-weight: 700; color: #333;
      text-align: center; line-height: 1.4;
    }

    .status-sub {
      font-size: 12px; color: #888;
      text-align: center; line-height: 1.6;
    }

    .steps-list { width: 100%; display: flex; flex-direction: column; gap: 10px; }

    .step-row {
      display: flex; align-items: center; gap: 10px;
      background: #fff; border-radius: 12px;
      padding: 12px 14px;
      border: 1.5px solid #e5e7eb;
    }
    .step-row.done { border-color: #c3e6d0; background: #f0faf4; }
    .step-row.active { border-color: #f1e23c; background: #fff8e1; }

    .step-num {
      width: 26px; height: 26px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; flex-shrink: 0;
    }
    .step-num.done { background: #289a4f; color: #fff; i { font-size: 12px; } }
    .step-num.active { background: #f1e23c; color: #c92946; }
    .step-num.todo { background: #e5e7eb; color: #aaa; }

    .step-info { flex: 1; }
    .step-info p { font-size: 11px; font-weight: 600; color: #333; margin: 0; }
    .step-info small { font-size: 10px; color: #888; }
    .step-row.done .step-info p { color: #289a4f; }
    .step-row.active .step-info p { color: #c92946; }

    .step-badge {
      font-size: 9px; font-weight: 600;
      padding: 3px 10px; border-radius: 20px;
    }
    .badge-done { background: #e8f5ee; color: #289a4f; }
    .badge-active { background: #fff3cd; color: #c92946; }
    .badge-todo { background: #f0f0f0; color: #aaa; }

    .info-banner {
      background: #fff; border: 1.5px solid #e5e7eb;
      border-radius: 12px; padding: 12px 14px;
      display: flex; align-items: flex-start; gap: 10px;
      width: 100%;
      i { font-size: 18px; color: #289a4f; margin-top: 2px; }
      p { font-size: 11px; color: #666; line-height: 1.6; margin: 0; }
      strong { color: #289a4f; }
    }

    .btn-logout {
      background: #fff; color: #c92946;
      border: 1.5px solid #f8c8d0; border-radius: 12px;
      padding: 12px; font-size: 13px; font-weight: 600;
      font-family: 'Poppins', sans-serif; cursor: pointer; width: 100%;
      transition: opacity .2s;
      &:hover { opacity: .85; }
    }

    @media (min-width: 768px) {
      .page {
        flex-direction: row;
        align-items: stretch;
      }

      .screen-header {
        flex: 0 0 40%;
        border-radius: 0;
        flex-direction: column;
        justify-content: center;
        padding: 48px;
        .logo-row { flex-direction: column; gap: 12px; text-align: center; }
        .logo-pin { width: 80px; height: 80px; svg { width: 44px; height: 44px; } }
        .logo-text-faso { font-size: 36px; }
        .logo-text-sub { font-size: 14px; }
      }

      .screen-body {
        flex: 1;
        justify-content: center;
        padding: 48px;
      }
    }
  `]
})
export class PendingValidation {
  auth = inject(AuthService);
  email = this.auth.currentUser()?.email ?? '';
}