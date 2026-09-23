import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="layout">
      <aside class="sidebar" [class.collapsed]="collapsed()">
        <div class="sidebar-logo">
          <div class="logo-row">
            <div class="logo-dot">
              <svg viewBox="0 0 18 18" fill="none">
                <path d="M9 1C5.686 1 3 3.686 3 7c0 4.5 6 10 6 10S15 11.5 15 7c0-3.314-2.686-6-6-6z" fill="#289a4f"/>
                <circle cx="9" cy="7" r="2.5" fill="#fff"/>
              </svg>
            </div>
            <div class="logo-text">
              <div class="logo-name">Faso Garages</div>
              <div class="logo-sub">Administration</div>
            </div>
          </div>
          <button class="toggle-btn" (click)="toggleSidebar()" [title]="collapsed() ? 'Déplier' : 'Replier'">
            <i class="ti" [class.ti-chevron-left]="!collapsed()" [class.ti-chevron-right]="collapsed()"></i>
          </button>
        </div>

        <div class="sidebar-section">Principal</div>
        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link" [title]="collapsed() ? 'Tableau de bord' : ''">
          <i class="ti ti-dashboard"></i><span>Tableau de bord</span>
        </a>
        <a routerLink="/admin/professionnels" routerLinkActive="active" class="nav-link" [title]="collapsed() ? 'Professionnels' : ''">
          <i class="ti ti-building-store"></i><span>Professionnels</span>
        </a>
        <a routerLink="/admin/utilisateurs" routerLinkActive="active" class="nav-link" [title]="collapsed() ? 'Utilisateurs' : ''">
          <i class="ti ti-users"></i><span>Utilisateurs</span>
        </a>
        <a routerLink="/admin/abonnements" routerLinkActive="active" class="nav-link" [title]="collapsed() ? 'Abonnements' : ''">
          <i class="ti ti-credit-card"></i><span>Abonnements</span>
        </a>
        <div class="sidebar-section">Contenu</div>
        <a routerLink="/admin/categories" routerLinkActive="active" class="nav-link" [title]="collapsed() ? 'Catégories' : ''">
          <i class="ti ti-category"></i><span>Catégories</span>
        </a>
        <a routerLink="/admin/services" routerLinkActive="active" class="nav-link" [title]="collapsed() ? 'Services' : ''">
          <i class="ti ti-list-check"></i><span>Services</span>
        </a>
        <a routerLink="/admin/astuces" routerLinkActive="active" class="nav-link" [title]="collapsed() ? 'Astuces' : ''">
          <i class="ti ti-bulb"></i><span>Astuces</span>
        </a>
        <a routerLink="/admin/numeros-utiles" routerLinkActive="active" class="nav-link" [title]="collapsed() ? 'Numéros utiles' : ''">
          <i class="ti ti-phone-call"></i><span>Numéros utiles</span>
        </a>

        <div class="sidebar-section">Communication</div>
        <a routerLink="/admin/publicites" routerLinkActive="active" class="nav-link" [title]="collapsed() ? 'Publicités' : ''">
          <i class="ti ti-ad-2"></i><span>Publicités</span>
        </a>
        <a routerLink="/admin/annonce" routerLinkActive="active" class="nav-link" [title]="collapsed() ? 'Bandeau d\\'annonce' : ''">
          <i class="ti ti-speakerphone"></i><span>Bandeau d'annonce</span>
        </a>

        <div class="sidebar-section">Système</div>
        <a routerLink="/admin/parametres" routerLinkActive="active" class="nav-link" [title]="collapsed() ? 'Paramètres' : ''">
          <i class="ti ti-settings"></i><span>Paramètres</span>
        </a>

        <div class="sidebar-bottom">
          <div class="admin-row">
            <div class="admin-avatar">AD</div>
            <div class="admin-text">
              <div class="admin-name">Administrateur</div>
              <div class="admin-role">{{ auth.currentUser()?.telephone }}</div>
            </div>
          </div>
          <div class="nav-link logout" (click)="auth.logout()" [title]="collapsed() ? 'Déconnexion' : ''">
            <i class="ti ti-logout"></i><span>Déconnexion</span>
          </div>
        </div>
      </aside>

      <main class="main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; font-family: 'Poppins', sans-serif; }

    .layout { display: flex; height: 100vh; background: var(--fg-bg); overflow: hidden; }

    .sidebar {
      width: 210px; background: #1a3d2b;
      display: flex; flex-direction: column; flex-shrink: 0;
      overflow-y: auto; overflow-x: hidden;
      transition: width .18s ease;
    }

    .sidebar.collapsed { width: 64px; }

    .sidebar-logo {
      padding: 20px 14px 14px; border-bottom: 1px solid rgba(255,255,255,.08);
      display: flex; align-items: center; justify-content: space-between; gap: 6px;
    }
    .logo-row { display: flex; align-items: center; gap: 8px; overflow: hidden; }
    .logo-dot {
      width: 28px; height: 28px; background: #f1e23c; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      svg { width: 16px; height: 16px; }
    }
    .logo-text { overflow: hidden; white-space: nowrap; }
    .logo-name { font-size: 13px; font-weight: 800; color: #fff; }
    .logo-sub { font-size: 8px; color: rgba(255,255,255,.45); letter-spacing: 1.5px; text-transform: uppercase; }

    .toggle-btn {
      width: 22px; height: 22px; border-radius: 6px; border: none; background: rgba(255,255,255,.08);
      display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
      i { font-size: 13px; color: rgba(255,255,255,.6); }
      &:hover { background: rgba(255,255,255,.16); }
    }

    .sidebar-section {
      padding: 14px 12px 4px; font-size: 8px; font-weight: 700;
      color: rgba(255,255,255,.3); letter-spacing: 1.5px; text-transform: uppercase;
      white-space: nowrap; overflow: hidden;
    }

    .nav-link {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 12px; margin: 1px 6px; border-radius: 8px; cursor: pointer;
      text-decoration: none; transition: background .15s;
      white-space: nowrap; overflow: hidden;
      i { font-size: 17px; color: rgba(255,255,255,.45); flex-shrink: 0; }
      span { font-size: 11.5px; font-weight: 500; color: rgba(255,255,255,.6); overflow: hidden; text-overflow: ellipsis; }
      &:hover:not(.active) { background: rgba(255,255,255,.05); }
      &.active { background: rgba(255,255,255,.1); i { color: #f1e23c; } span { color: #fff; } }
      &.logout { margin-top: 4px; }
    }

    .sidebar-bottom { margin-top: auto; padding: 10px; border-top: 1px solid rgba(255,255,255,.08); }
    .admin-row { display: flex; align-items: center; gap: 8px; padding: 6px; margin-bottom: 4px; overflow: hidden; }
    .admin-avatar {
      width: 30px; height: 30px; border-radius: 50%; background: var(--fg-green);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .admin-text { overflow: hidden; white-space: nowrap; }
    .admin-name { font-size: 11px; font-weight: 600; color: #fff; }
    .admin-role { font-size: 8px; color: rgba(255,255,255,.4); max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .main { flex: 1; overflow-y: auto; }

    /* Sidebar repliée : masquer tout le texte, garder les icônes centrées */
    .sidebar.collapsed {
      .logo-text, .sidebar-section, .admin-text, .nav-link span { display: none; }
      .sidebar-logo { justify-content: center; flex-direction: column; gap: 8px; }
      .nav-link { justify-content: center; margin: 1px 8px; }
      .admin-row { justify-content: center; }
    }

    @media (max-width: 900px) {
      .sidebar:not(.collapsed) { width: 64px; }
      .sidebar:not(.collapsed) .logo-text,
      .sidebar:not(.collapsed) .sidebar-section,
      .sidebar:not(.collapsed) .admin-text,
      .sidebar:not(.collapsed) .nav-link span { display: none; }
      .sidebar:not(.collapsed) .nav-link { justify-content: center; }
      .sidebar:not(.collapsed) .admin-row { justify-content: center; }
      .toggle-btn { display: none; }
    }
  `],
})
export class AdminDashboard {
  auth = inject(AuthService);
  collapsed = signal(false);

  toggleSidebar(): void {
    this.collapsed.update((v) => !v);
  }
}