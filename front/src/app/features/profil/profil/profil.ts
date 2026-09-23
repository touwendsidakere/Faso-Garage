import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [RouterLink],
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
            <div class="logo-text-sub">Mon profil</div>
          </div>
        </div>
        <div class="avatar-wrap">
          <div class="avatar">{{ initiales() }}</div>
          <div class="edit-avatar"><i class="ti ti-pencil"></i></div>
        </div>
      </div>

      <div class="body">

        <!-- NOM -->
        <div class="user-name-center">
          <h2>{{ nomComplet() }}</h2>
          <p>{{ auth.currentUser()?.email }}</p>
          <span class="role-badge">{{ roleLabel() }}</span>
        </div>

        <!-- Si non connecté -->
        @if (!auth.isLoggedIn()) {
          <div class="info-card" style="padding:20px;text-align:center">
            <p style="color:#888;font-size:13px;margin-bottom:16px">
              Connectez-vous pour accéder à votre profil
            </p>
            <a routerLink="/connexion" class="btn-connect">Se connecter</a>
          </div>
        } @else {

          <div class="section-title">Mes informations</div>

          <div class="info-card">
            <div class="info-row">
              <div class="info-icon green"><i class="ti ti-user"></i></div>
              <div class="info-content">
                <div class="info-label">Nom complet</div>
                <div class="info-value">{{ nomComplet() }}</div>
              </div>
              <i class="ti ti-pencil info-edit"></i>
            </div>
            <div class="info-row">
              <div class="info-icon green"><i class="ti ti-mail"></i></div>
              <div class="info-content">
                <div class="info-label">Adresse email</div>
                <div class="info-value">{{ auth.currentUser()?.email }}</div>
              </div>
              <i class="ti ti-pencil info-edit"></i>
            </div>
            <div class="info-row">
              <div class="info-icon yellow"><i class="ti ti-lock"></i></div>
              <div class="info-content">
                <div class="info-label">Mot de passe</div>
                <div class="info-value">••••••••</div>
              </div>
              <i class="ti ti-pencil info-edit"></i>
            </div>
          </div>

          <div class="section-title">Mon activité</div>

          <div class="menu-card">
            <div class="menu-row">
              <div class="menu-icon" style="background:#e8f5ee">
                <i class="ti ti-star" style="color:#289a4f"></i>
              </div>
              <div class="menu-label">Mes avis</div>
              <i class="ti ti-chevron-right menu-arrow"></i>
            </div>
            <div class="menu-row">
              <div class="menu-icon" style="background:#fff8e1">
                <i class="ti ti-heart" style="color:#c8a800"></i>
              </div>
              <div class="menu-label">Mes favoris</div>
              <i class="ti ti-chevron-right menu-arrow"></i>
            </div>
          </div>

          <div class="section-title">Paramètres</div>

          <div class="menu-card">
            <div class="menu-row">
              <div class="menu-icon" style="background:#e8f0ff">
                <i class="ti ti-bell" style="color:#3a6fd8"></i>
              </div>
              <div class="menu-label">Notifications</div>
              <i class="ti ti-chevron-right menu-arrow"></i>
            </div>
            @if (!auth.isPro()) {
              <div class="menu-row" routerLink="/inscription-pro">
                <div class="menu-icon" style="background:#e8f5ee">
                  <i class="ti ti-building-store" style="color:#289a4f"></i>
                </div>
                <div class="menu-label">Devenir professionnel</div>
                <i class="ti ti-chevron-right menu-arrow"></i>
              </div>
            }
            @if (auth.isPro()) {
              <div class="menu-row" routerLink="/mon-etablissement">
                <div class="menu-icon" style="background:#e8f5ee">
                  <i class="ti ti-building-store" style="color:#289a4f"></i>
                </div>
                <div class="menu-label">Mon établissement</div>
                <i class="ti ti-chevron-right menu-arrow"></i>
              </div>
            }
            <div class="menu-row">
              <div class="menu-icon" style="background:#f5f0ff">
                <i class="ti ti-help-circle" style="color:#7c4dff"></i>
              </div>
              <div class="menu-label">Aide & support</div>
              <i class="ti ti-chevron-right menu-arrow"></i>
            </div>
          </div>

          <button class="btn-logout" (click)="auth.logout()">
            <i class="ti ti-logout"></i>
            Se déconnecter
          </button>

        }

      </div>

    </div>
  `,
  styles: [`
    .page {
      font-family: 'Poppins', sans-serif;
      min-height: 100vh;
      background: #f7f8fa;
      display: flex; flex-direction: column;
      padding-bottom: 80px;
    }

    .screen-header {
      background: #289a4f;
      padding: 52px 20px 48px;
      border-radius: 0 0 28px 28px;
      display: flex; flex-direction: column;
      position: relative;
    }

    .logo-row { display: flex; align-items: center; gap: 8px; align-self: flex-start; }

    .logo-pin {
      width: 26px; height: 26px; background: #f1e23c;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      svg { width: 14px; height: 14px; }
    }

    .logo-text-faso { font-size: 15px; font-weight: 800; color: #fff; }
    .logo-text-sub { font-size: 9px; font-weight: 700; color: #f1e23c; letter-spacing: 2px; text-transform: uppercase; }

    .avatar-wrap {
      position: absolute; bottom: -28px; left: 50%; transform: translateX(-50%);
    }

    .avatar {
      width: 56px; height: 56px; border-radius: 50%; background: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 800; color: #289a4f;
      border: 3px solid #fff; box-shadow: 0 2px 12px rgba(0,0,0,.15);
    }

    .edit-avatar {
      position: absolute; bottom: 0; right: 0;
      width: 20px; height: 20px; background: #c92946;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      border: 2px solid #fff;
      i { font-size: 10px; color: #fff; }
    }

    .body {
      flex: 1; padding: 40px 14px 16px;
      display: flex; flex-direction: column; gap: 12px;
      max-width: 480px; width: 100%; margin: 0 auto;
    }

    .user-name-center { text-align: center; }
    .user-name-center h2 { font-size: 16px; font-weight: 700; color: #222; margin: 0; }
    .user-name-center p { font-size: 11px; color: #aaa; margin: 3px 0 0; }
    .role-badge {
      display: inline-block; background: #e8f5ee; color: #289a4f;
      font-size: 9px; font-weight: 700; padding: 3px 12px; border-radius: 20px; margin-top: 6px;
    }

    .section-title {
      font-size: 10px; font-weight: 700; color: #289a4f;
      text-transform: uppercase; letter-spacing: .5px;
      display: flex; align-items: center; gap: 8px;
      &::after { content: ''; flex: 1; height: 1px; background: #e0f0e8; }
    }

    .info-card {
      background: #fff; border-radius: 12px; border: 1.5px solid #f0f0f0; overflow: hidden;
    }

    .info-row {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; border-bottom: 1px solid #f5f5f5;
      &:last-child { border-bottom: none; }
    }

    .info-icon {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      &.green { background: #e8f5ee; i { color: #289a4f; } }
      &.yellow { background: #fff8e1; i { color: #c8a800; } }
      i { font-size: 15px; }
    }

    .info-content { flex: 1; }
    .info-label { font-size: 9px; color: #aaa; font-weight: 500; }
    .info-value { font-size: 11px; font-weight: 600; color: #333; margin-top: 1px; }
    .info-edit { color: #289a4f; font-size: 14px; cursor: pointer; }

    .menu-card {
      background: #fff; border-radius: 12px; border: 1.5px solid #f0f0f0; overflow: hidden;
    }

    .menu-row {
      display: flex; align-items: center; gap: 10px;
      padding: 13px 14px; border-bottom: 1px solid #f5f5f5; cursor: pointer;
      transition: background .15s;
      &:last-child { border-bottom: none; }
      &:hover { background: #f9fafb; }
    }

    .menu-icon {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      i { font-size: 16px; }
    }

    .menu-label { flex: 1; font-size: 11px; font-weight: 600; color: #333; }
    .menu-arrow { font-size: 15px; color: #ddd; }
    .menu-badge {
      background: #c92946; color: #fff;
      font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 10px;
    }

    .btn-logout {
      background: #fff0f2; color: #c92946;
      border: 1.5px solid #f8c8d0; border-radius: 12px;
      padding: 13px; font-size: 13px; font-weight: 700;
      font-family: 'Poppins', sans-serif; cursor: pointer; width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: opacity .2s;
      &:hover { opacity: .85; }
      i { font-size: 18px; }
    }

    .btn-connect {
      background: #289a4f; color: #fff; border: none; border-radius: 10px;
      padding: 10px 24px; font-size: 13px; font-weight: 600;
      font-family: 'Poppins', sans-serif; cursor: pointer;
      text-decoration: none; display: inline-block;
    }

    @media (min-width: 768px) {
      .page { flex-direction: row; align-items: flex-start; }

      .screen-header {
        flex: 0 0 320px; border-radius: 0;
        min-height: 100vh; padding: 48px 32px 80px;
        position: sticky; top: 0;
      }

      .avatar-wrap {
        position: relative; bottom: auto; left: auto;
        transform: none; margin-top: 32px; align-self: center;
      }

      .body {
        flex: 1; padding: 32px 48px;
        max-width: none; margin: 0;
      }
    }
  `]
})
export class Profil {
  auth = inject(AuthService);
  router = inject(Router);

  nomComplet = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return 'Invité';
    if (u.nom && u.prenom) return `${u.prenom} ${u.nom}`;
    return u.telephone;
  });

  initiales = computed(() => {
    const nom = this.nomComplet();
    return nom.slice(0, 2).toUpperCase();
  });

  roleLabel = computed(() => {
    const r = this.auth.getRole();
    if (r === 'ROLE_ADMIN') return 'Administrateur';
    if (r === 'ROLE_PRO') return 'Professionnel';
    return 'Utilisateur';
  });
}