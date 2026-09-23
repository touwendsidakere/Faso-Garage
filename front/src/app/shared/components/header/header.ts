import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AnnonceService } from '../../../core/services/api.services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (annonceTexte()) {
      <div class="annonce-bar">
        <div class="annonce-track">{{ annonceTexte() }}</div>
      </div>
    }

    <header class="header-main" [class.scrolled]="scrolled()">
      <div class="header-inner">
        <a routerLink="/" class="logo" (click)="closeMobileMenu()">
          <img src="/logo.png" alt="Faso Garages" class="logo-img">
        </a>

        <nav class="nav-center">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Accueil</a>
          <a routerLink="/carte" routerLinkActive="active">Carte</a>
          <a routerLink="/toutes-les-entreprises" routerLinkActive="active">Toutes les entreprises</a>
          <a routerLink="/numeros-utiles" routerLinkActive="active">Numéros utiles</a>
          <a routerLink="/astuces" routerLinkActive="active">Astuces</a>
        </nav>

        <div class="nav-right">
          @if (!auth.isLoggedIn()) {
            <a routerLink="/connexion" class="btn btn-ghost">Connexion</a>
            <a routerLink="/inscription-pro" class="btn btn-primary">Devenir partenaire</a>
          } @else {
            <div class="account-menu">
              <button class="account-trigger" type="button" (click)="toggleAccountMenu($event)">
                <span class="account-avatar"><i class="ti ti-user"></i></span>
                <span class="account-name">{{ nomAffiche() }}</span>
                <i class="ti ti-chevron-down" [class.rotated]="accountMenuOpen()"></i>
              </button>

              @if (accountMenuOpen()) {
                <div class="account-dropdown" (click)="$event.stopPropagation()">
                  @if (auth.isAdmin()) {
                    <a routerLink="/admin" class="dropdown-item">
                      <i class="ti ti-layout-dashboard"></i> Dashboard admin
                    </a>
                  }
                  @if (auth.isPro()) {
                    <a routerLink="/mon-etablissement" class="dropdown-item">
                      <i class="ti ti-building-store"></i> Mon espace pro
                    </a>
                  }
                  @if (auth.isUser()) {
                    <a routerLink="/profil" class="dropdown-item">
                      <i class="ti ti-user-circle"></i> Mon profil
                    </a>
                  }
                  <button class="dropdown-item danger" type="button" (click)="auth.logout()">
                    <i class="ti ti-logout"></i> Déconnexion
                  </button>
                </div>
              }
            </div>
          }

          <button class="burger" type="button" (click)="toggleMobileMenu()" aria-label="Menu">
            <i class="ti" [class.ti-menu-2]="!mobileMenuOpen()" [class.ti-x]="mobileMenuOpen()"></i>
          </button>
        </div>
      </div>

      @if (mobileMenuOpen()) {
        <div class="mobile-menu">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMobileMenu()">Accueil</a>
          <a routerLink="/carte" routerLinkActive="active" (click)="closeMobileMenu()">Carte</a>
          <a routerLink="/toutes-les-entreprises" routerLinkActive="active" (click)="closeMobileMenu()">Toutes les entreprises</a>
          <a routerLink="/numeros-utiles" routerLinkActive="active" (click)="closeMobileMenu()">Numéros utiles</a>
          <a routerLink="/astuces" routerLinkActive="active" (click)="closeMobileMenu()">Astuces</a>
          <hr />
          @if (!auth.isLoggedIn()) {
            <a routerLink="/connexion" (click)="closeMobileMenu()">Connexion</a>
            <a routerLink="/inscription-pro" class="mobile-cta" (click)="closeMobileMenu()">Devenir partenaire</a>
          } @else {
            @if (auth.isAdmin()) {
              <a routerLink="/admin" (click)="closeMobileMenu()">Dashboard admin</a>
            }
            @if (auth.isPro()) {
              <a routerLink="/mon-etablissement" (click)="closeMobileMenu()">Mon espace pro</a>
            }
            @if (auth.isUser()) {
              <a routerLink="/profil" (click)="closeMobileMenu()">Mon profil</a>
            }
            <button type="button" class="mobile-logout" (click)="auth.logout(); closeMobileMenu()">
              <i class="ti ti-logout"></i> Déconnexion
            </button>
          }
        </div>
      }
    </header>
  `,
  styles: [`
    :host { display: block; }

    // ─── BANDE DÉFILANTE ────────────────────────────────────────
    .annonce-bar {
      background: var(--fg-green-dark);
      color: #fff;
      height: 34px;
      overflow: hidden;
      white-space: nowrap;
      display: flex;
      align-items: center;
      position: relative;
      z-index: 201;
    }

    .annonce-track {
      display: inline-block;
      padding-left: 100%;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: .2px;
      animation: annonce-scroll 20s linear infinite;
    }

    @keyframes annonce-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-100%); }
    }

    // ─── HEADER PRINCIPAL ───────────────────────────────────────
    .header-main {
      position: sticky;
      top: 0;
      z-index: 200;
      background: var(--fg-white);
      border-bottom: 1px solid var(--fg-border);
      transition: box-shadow .2s ease;

      &.scrolled {
        box-shadow: var(--fg-shadow-md);
      }
    }

    .header-inner {
      max-width: 1280px;
      margin: 0 auto;
      height: 72px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }

    .logo-img {
      height: 40px;
      width: auto;
      display: block;
    }

    .nav-center {
      display: flex;
      align-items: center;
      gap: 32px;

      a {
        color: var(--fg-text);
        text-decoration: none;
        font-size: 14.5px;
        font-weight: 600;
        padding: 8px 2px;
        position: relative;
        transition: color .2s;

        &::after {
          content: '';
          position: absolute;
          left: 0; bottom: -2px;
          width: 0; height: 2px;
          background: var(--fg-green);
          transition: width .2s;
        }

        &:hover { color: var(--fg-green); }
        &.active { color: var(--fg-green); }
        &.active::after { width: 100%; }
      }
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .btn {
      padding: 10px 18px;
      border-radius: var(--fg-btn-radius);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      transition: all .2s;
      border: none;
      cursor: pointer;
    }

    .btn-ghost {
      color: var(--fg-text);
      background: transparent;

      &:hover { background: var(--fg-bg); }
    }

    .btn-primary {
      background: var(--fg-green);
      color: #fff;

      &:hover { background: var(--fg-green-dark); }
    }

    // ─── MENU COMPTE ────────────────────────────────────────────
    .account-menu {
      position: relative;
    }

    .account-trigger {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--fg-bg);
      border: 1px solid var(--fg-border);
      border-radius: 999px;
      padding: 6px 14px 6px 6px;
      cursor: pointer;

      i.ti-chevron-down {
        font-size: 14px;
        color: var(--fg-text-secondary);
        transition: transform .2s;
        &.rotated { transform: rotate(180deg); }
      }
    }

    .account-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--fg-green-light);
      color: var(--fg-green-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .account-name {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--fg-text);
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .account-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: #fff;
      border: 1px solid var(--fg-border);
      border-radius: var(--fg-card-radius);
      box-shadow: var(--fg-shadow-md);
      min-width: 210px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--fg-text);
      text-decoration: none;
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;

      &:hover { background: var(--fg-bg); }
      &.danger { color: var(--fg-red); }

      i { font-size: 17px; }
    }

    // ─── BURGER (mobile) ────────────────────────────────────────
    .burger {
      display: none;
      width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
      background: var(--fg-bg);
      border: 1px solid var(--fg-border);
      border-radius: var(--fg-btn-radius);
      cursor: pointer;
      font-size: 20px;
      color: var(--fg-text);
    }

    .mobile-menu {
      display: none;
      flex-direction: column;
      padding: 12px 24px 20px;
      border-top: 1px solid var(--fg-border);
      background: #fff;

      a, button.mobile-logout {
        padding: 12px 4px;
        font-size: 15px;
        font-weight: 600;
        color: var(--fg-text);
        text-decoration: none;
        background: none;
        border: none;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        &.active { color: var(--fg-green); }
      }

      .mobile-cta {
        color: var(--fg-green);
      }

      .mobile-logout {
        color: var(--fg-red);
      }

      hr {
        border: none;
        border-top: 1px solid var(--fg-border);
        margin: 6px 0;
      }
    }

    @media (max-width: 900px) {
      .nav-center { display: none; }
      .nav-right .btn-ghost, .nav-right .btn-primary { display: none; }
      .burger { display: flex; }
      .mobile-menu { display: flex; }
      .header-inner { height: 64px; padding: 0 16px; }
    }
  `],
})
export class Header {
  auth = inject(AuthService);
  private annonceService = inject(AnnonceService);
  private router = inject(Router);

  scrolled = signal(false);
  mobileMenuOpen = signal(false);
  accountMenuOpen = signal(false);

  private annonces = signal<{ texte: string; actif: boolean }[]>([]);
  annonceTexte = computed(() => {
    const active = this.annonces().find((a) => a.actif && a.texte?.trim());
    return active?.texte ?? null;
  });

  nomAffiche = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return '';
    if (u.prenom) return u.prenom;
    return u.telephone;
  });

  constructor() {
    this.annonceService.getActive().subscribe({
      next: (data) => this.annonces.set(data),
      error: () => this.annonces.set([]),
    });

    this.router.events.subscribe(() => {
      this.mobileMenuOpen.set(false);
      this.accountMenuOpen.set(false);
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 4);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.accountMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleAccountMenu(event: Event): void {
    event.stopPropagation();
    this.accountMenuOpen.update((v) => !v);
  }
}
