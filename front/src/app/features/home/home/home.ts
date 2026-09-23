import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { ProfessionnelService } from '../../../core/services/professionnel.service';
import {
  CategorieService,
  NumerosUtilesService,
  AstucesService,
  PubliciteService,
} from '../../../core/services/api.services';
import { Professionnel, Categorie, NumeroUtile, Astuce, Publicite } from '../../../core/models';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';

const ICONE_MAP: Record<string, string> = {
  'fa-wrench': 'ti-tool',
  'fa-truck': 'ti-truck',
  'fa-gas-pump': 'ti-gas-station',
  'fa-bolt': 'ti-bolt',
  'fa-car': 'ti-car',
  'fa-shield-alt': 'ti-shield-check',
  'fa-car-crash': 'ti-car-crash',
  'fa-car-wash': 'ti-spray',
};

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const VILLES = [
  'Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora',
  'Ouahigouya', 'Tenkodogo', "Fada N'Gourma", 'Dédougou',
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, SlicePipe, MediaUrlPipe],
  template: `
    <div class="home">

      <!-- ═══════════════ HERO ═══════════════ -->
      <section class="hero">
        <div class="hero-inner">
          <h1>Trouvez le bon professionnel de l'automobile, <span>partout au Burkina</span></h1>
          <p>Garages, dépanneurs, stations, carrosseries et assurances — géolocalisés et à portée de clic.</p>

          <div class="search-box">
            <div class="search-field">
              <i class="ti ti-search"></i>
              <input type="text" [(ngModel)]="motCle" placeholder="Nom, service, spécialité..." (keyup.enter)="rechercher()">
            </div>
            <div class="search-field search-select">
              <i class="ti ti-map-pin"></i>
              <select [(ngModel)]="villeChoisie">
                <option value="">Toutes les villes</option>
                @for (v of villes; track v) {
                  <option [value]="v">{{ v }}</option>
                }
              </select>
            </div>
            <div class="search-field search-select">
              <i class="ti ti-category"></i>
              <select [(ngModel)]="categorieChoisie">
                <option value="">Toutes les catégories</option>
                @for (c of categories(); track c.id) {
                  <option [value]="c.id">{{ c.libelle }}</option>
                }
              </select>
            </div>
            <button class="search-btn" (click)="rechercher()">
              <i class="ti ti-search"></i> Rechercher
            </button>
          </div>
        </div>
      </section>

      <!-- ═══════════════ CARROUSEL PUB ═══════════════ -->
      @if (publicites().length > 0) {
        <section class="pub-section">
          <div class="pub-carousel" (mouseenter)="pauseAuto()" (mouseleave)="resumeAuto()">
            @for (pub of publicites(); track pub.id; let i = $index) {
              @if (i === slideActif()) {
                <div class="pub-slide">
                  @if (pub.type === 'IMAGE') {
                    <img [src]="pub.mediaUrl | mediaUrl" [alt]="'Publicité ' + (i + 1)">
                  } @else {
                    <video [src]="pub.mediaUrl | mediaUrl" [muted]="videoMuted()" autoplay loop
                           (click)="toggleSon()" (ended)="next()"></video>
                    @if (videoMuted()) {
                      <div class="mute-badge"><i class="ti ti-volume-3"></i> Cliquez pour le son</div>
                    }
                  }
                  @if (pub.lienRedirection) {
                    <a [href]="pub.lienRedirection" target="_blank" class="pub-link-overlay" rel="noopener"></a>
                  }
                </div>
              }
            }

            @if (publicites().length > 1) {
              <div class="pub-dots">
                @for (pub of publicites(); track pub.id; let i = $index) {
                  <span class="dot" [class.active]="i === slideActif()" (click)="goToSlide(i)"></span>
                }
              </div>
            }
          </div>
        </section>
      }

      <!-- ═══════════════ MIEUX NOTÉES ═══════════════ -->
      <section class="section top-notes-section">
        <div class="section-head">
          <h2>Les mieux notées</h2>
        </div>

        @if (loadingPros()) {
          <div class="loading-row">
            @for (i of [1,2,3,4,5,6]; track i) { <div class="skeleton-card"></div> }
          </div>
        } @else if (topNotees().length === 0) {
          <div class="empty-state">
            <i class="ti ti-star"></i>
            <p>Pas encore assez d'avis pour établir un classement</p>
          </div>
        } @else {
          <div class="pros-grid">
            @for (pro of topNotees(); track pro.id) {
              <a class="pro-card" [routerLink]="['/professionnel', pro.id]">
                <div class="pro-cover">
                  @if (pro.photoCouverture) {
                    <img [src]="pro.photoCouverture | mediaUrl" [alt]="pro.nomEtablissement">
                  } @else {
                    <div class="pro-cover-placeholder">
                      <i class="ti ti-building-store"></i>
                    </div>
                  }
                  <span class="pro-rank-badge">⭐ {{ pro.moyenneNotes | number:'1.1-1' }}</span>
                </div>
                <div class="pro-body">
                  <div class="pro-name">{{ pro.nomEtablissement }}</div>
                  <div class="pro-cat">{{ pro.categorie }} · {{ pro.ville }}</div>
                  <div class="pro-meta">
                    <span class="pro-note">
                      <i class="ti ti-star-filled"></i> {{ pro.moyenneNotes | number:'1.1-1' }}
                      <span class="pro-avis">({{ pro.nombreAvis }} avis)</span>
                    </span>
                  </div>
                </div>
              </a>
            }
          </div>
        }

        <div class="section-cta">
          <a routerLink="/toutes-les-entreprises" class="btn-see-all">
            Toutes les entreprises <i class="ti ti-arrow-right"></i>
          </a>
        </div>
      </section>

      <!-- ═══════════════ ENTREPRISES À PROXIMITÉ ═══════════════ -->
      <section class="section proches-section">
        <div class="section-head">
          <h2>Entreprises à proximité</h2>
        </div>

        @if (loadingPros()) {
          <div class="loading-row">
            @for (i of [1,2,3,4]; track i) { <div class="skeleton-card"></div> }
          </div>
        } @else if (prosProches().length === 0) {
          <div class="empty-state">
            <i class="ti ti-building-store"></i>
            <p>Aucun établissement disponible pour le moment</p>
          </div>
        } @else {
          <div class="pros-grid">
            @for (pro of prosProches(); track pro.id) {
              <a class="pro-card" [routerLink]="['/professionnel', pro.id]">
                <div class="pro-cover">
                  @if (pro.photoCouverture) {
                    <img [src]="pro.photoCouverture | mediaUrl" [alt]="pro.nomEtablissement">
                  } @else {
                    <div class="pro-cover-placeholder">
                      <i class="ti ti-building-store"></i>
                    </div>
                  }
                  @if (pro.distance !== undefined) {
                    <span class="pro-distance-badge">{{ pro.distance | number:'1.1-1' }} km</span>
                  }
                </div>
                <div class="pro-body">
                  <div class="pro-name">{{ pro.nomEtablissement }}</div>
                  <div class="pro-cat">{{ pro.categorie }}</div>
                  <div class="pro-meta">
                    <span class="pro-note">
                      <i class="ti ti-star-filled"></i> {{ pro.moyenneNotes | number:'1.1-1' }}
                      <span class="pro-avis">({{ pro.nombreAvis }})</span>
                    </span>
                    <span class="pro-ville"><i class="ti ti-map-pin"></i> {{ pro.ville }}</span>
                  </div>
                </div>
              </a>
            }
          </div>
        }

        <div class="section-cta">
          <a routerLink="/carte" class="btn-see-all">
            Voir sur la carte <i class="ti ti-arrow-right"></i>
          </a>
        </div>
      </section>

      <!-- ═══════════════ CATÉGORIES ═══════════════ -->
      <section class="section categories-section">
        <div class="section-head">
          <h2>Catégories</h2>
        </div>

        @if (categories().length === 0) {
          <div class="empty-state">
            <i class="ti ti-category"></i>
            <p>Aucune catégorie disponible pour le moment</p>
          </div>
        } @else {
          <div class="categories-grid">
            @for (c of categories().slice(0, 6); track c.id) {
              <a class="cat-card" [routerLink]="['/toutes-les-entreprises']" [queryParams]="{ categorieId: c.id }">
                <div class="cat-icon"><i class="ti" [class]="mapIcone(c.icone)"></i></div>
                <div class="cat-name">{{ c.libelle }}</div>
                <div class="cat-count">{{ compteurCategorie(c.id) }} établissement(s)</div>
              </a>
            }
          </div>
        }

        <div class="section-cta">
          <a routerLink="/categories" class="btn-see-all-outline">
            Voir plus <i class="ti ti-arrow-right"></i>
          </a>
        </div>
      </section>

      <!-- ═══════════════ APERÇU NUMÉROS UTILES ═══════════════ -->
      @if (numeros().length > 0) {
        <section class="section numeros-section">
          <div class="section-head">
            <h2>Numéros utiles</h2>
            <a routerLink="/numeros-utiles" class="see-all">Voir tout <i class="ti ti-arrow-right"></i></a>
          </div>

          <div class="numeros-grid">
            @for (n of numeros().slice(0, 4); track n.id) {
              <a class="numero-card" [href]="'tel:' + n.numero">
                <div class="numero-icon"><i class="ti ti-phone-call"></i></div>
                <div class="numero-info">
                  <div class="numero-nom">{{ n.nom }}</div>
                  <div class="numero-num">{{ n.numero }}</div>
                </div>
              </a>
            }
          </div>
        </section>
      }

      <!-- ═══════════════ APERÇU ASTUCES ═══════════════ -->
      @if (astuces().length > 0) {
        <section class="section astuces-section">
          <div class="section-head">
            <h2>Dernières astuces</h2>
            <a routerLink="/astuces" class="see-all">Voir tout <i class="ti ti-arrow-right"></i></a>
          </div>

          <div class="astuces-grid">
            @for (a of astuces().slice(0, 3); track a.id) {
              <a class="astuce-card" routerLink="/astuces">
                <div class="astuce-icon"><i class="ti ti-bulb"></i></div>
                <div class="astuce-titre">{{ a.titre }}</div>
                <div class="astuce-extrait">{{ a.contenu | slice:0:110 }}...</div>
              </a>
            }
          </div>
        </section>
      }

    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }

    .home { background: var(--fg-bg); }

    // ─── HERO ───────────────────────────────────
    .hero {
      background: linear-gradient(135deg, var(--fg-green) 0%, var(--fg-green-dark) 100%);
      padding: 80px 24px 100px;
    }

    .hero-inner {
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
    }

    .hero h1 {
      font-size: 34px;
      font-weight: 800;
      color: #fff;
      line-height: 1.3;
      margin: 0 0 14px;

      span { color: var(--fg-yellow); }
    }

    .hero p {
      font-size: 15px;
      color: rgba(255,255,255,.85);
      margin: 0 0 32px;
    }

    .search-box {
      background: #fff;
      border-radius: 16px;
      padding: 10px;
      display: flex;
      gap: 8px;
      box-shadow: var(--fg-shadow-md);
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 160px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 10px;
      background: var(--fg-bg);

      i { font-size: 16px; color: #999; }

      input, select {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-family: 'Poppins', sans-serif;
        font-size: 13px;
        color: var(--fg-text);
        min-width: 0;
      }
    }

    .search-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: var(--fg-green);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 0 22px;
      font-size: 13px;
      font-weight: 700;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      transition: background .2s;
      white-space: nowrap;

      &:hover { background: var(--fg-green-dark); }
    }

    // ─── CARROUSEL PUB ──────────────────────────
    .pub-section {
      max-width: 1280px;
      margin: -60px auto 0;
      padding: 0 24px;
      position: relative;
      z-index: 5;
    }

    .pub-carousel {
      position: relative;
      border-radius: var(--fg-card-radius);
      overflow: hidden;
      box-shadow: var(--fg-shadow-md);
      aspect-ratio: 21 / 6;
      background: #000;
    }

    .pub-slide {
      width: 100%;
      height: 100%;
      position: relative;

      img, video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        cursor: pointer;
      }
    }

    .pub-link-overlay {
      position: absolute;
      inset: 0;
    }

    .mute-badge {
      position: absolute;
      bottom: 14px; right: 14px;
      background: rgba(0,0,0,.6);
      color: #fff;
      font-size: 11px;
      padding: 6px 12px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 5px;
      pointer-events: none;
    }

    .pub-dots {
      position: absolute;
      bottom: 12px; left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 6px;
      z-index: 2;
    }

    .pub-dots .dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: rgba(255,255,255,.5);
      cursor: pointer;
      transition: background .2s;

      &.active { background: #fff; }
    }

    // ─── SECTIONS GÉNÉRIQUES ────────────────────
    .section {
      max-width: 1280px;
      margin: 0 auto;
      padding: 56px 24px 0;
    }

    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;

      h2 {
        font-size: 22px;
        font-weight: 800;
        color: var(--fg-text);
        margin: 0;
      }
    }

    .see-all {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 600;
      color: var(--fg-green);
      text-decoration: none;

      i { font-size: 15px; }
      &:hover { text-decoration: underline; }
    }

    // ─── MIEUX NOTÉES ───────────────────────────
    .pro-rank-badge {
      position: absolute;
      top: 10px; left: 10px;
      background: var(--fg-yellow);
      color: #7a5c00;
      font-size: 11.5px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 999px;
    }

    // ─── CATÉGORIES ─────────────────────────────
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
    }

    .cat-card {
      background: #fff;
      border: 1px solid var(--fg-border);
      border-radius: var(--fg-card-radius);
      padding: 22px 16px;
      text-align: center;
      text-decoration: none;
      transition: all .2s;

      &:hover {
        border-color: var(--fg-green);
        box-shadow: var(--fg-shadow-sm);
        transform: translateY(-2px);
      }
    }

    .cat-icon {
      width: 52px; height: 52px;
      background: var(--fg-green-light);
      color: var(--fg-green-dark);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 12px;
      font-size: 24px;
    }

    .cat-name { font-size: 14px; font-weight: 700; color: var(--fg-text); }
    .cat-count { font-size: 11px; color: var(--fg-text-secondary); margin-top: 4px; }

    // ─── PROS PROCHES / MIEUX NOTÉES ────────────
    .pros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }

    .pro-card {
      background: #fff;
      border: 1px solid var(--fg-border);
      border-radius: var(--fg-card-radius);
      overflow: hidden;
      text-decoration: none;
      transition: all .2s;

      &:hover { box-shadow: var(--fg-shadow-md); transform: translateY(-2px); }
    }

    .pro-cover {
      position: relative;
      height: 140px;
      background: var(--fg-bg);

      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .pro-cover-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background: var(--fg-green-light);
      i { font-size: 32px; color: var(--fg-green-dark); }
    }

    .pro-distance-badge {
      position: absolute;
      top: 10px; right: 10px;
      background: rgba(0,0,0,.65);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
    }

    .pro-body { padding: 14px 16px; }
    .pro-name { font-size: 14.5px; font-weight: 700; color: var(--fg-text); margin-bottom: 2px; }
    .pro-cat { font-size: 12px; color: var(--fg-text-secondary); margin-bottom: 8px; }

    .pro-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }

    .pro-note {
      display: flex; align-items: center; gap: 3px;
      color: var(--fg-yellow);
      font-weight: 700;

      i { font-size: 13px; }
    }
    .pro-avis { color: var(--fg-text-secondary); font-weight: 400; }

    .pro-ville {
      display: flex; align-items: center; gap: 3px;
      color: var(--fg-text-secondary);
      i { font-size: 13px; }
    }

    // ─── CTA SECTIONS ───────────────────────────
    .section-cta {
      text-align: center;
      margin-top: 28px;
    }

    .btn-see-all {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--fg-green);
      color: #fff;
      padding: 12px 26px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      transition: background .2s;

      &:hover { background: var(--fg-green-dark); }
      i { font-size: 16px; }
    }

    .btn-see-all-outline {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      color: var(--fg-green);
      border: 1.5px solid var(--fg-green);
      padding: 11px 24px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 700;
      text-decoration: none;
      transition: all .2s;

      &:hover { background: var(--fg-green-light); }
      i { font-size: 15px; }
    }

    // ─── NUMÉROS UTILES ─────────────────────────
    .numeros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 14px;
    }

    .numero-card {
      background: var(--fg-red-light);
      border: 1px solid #f6c9d1;
      border-radius: var(--fg-card-radius);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      transition: transform .2s;

      &:hover { transform: translateY(-2px); }
    }

    .numero-icon {
      width: 40px; height: 40px;
      background: var(--fg-red);
      color: #fff;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .numero-nom { font-size: 13px; font-weight: 700; color: var(--fg-text); }
    .numero-num { font-size: 15px; font-weight: 800; color: var(--fg-red); }

    // ─── ASTUCES ────────────────────────────────
    .astuces-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 18px;
    }

    .astuce-card {
      background: #fff;
      border: 1px solid var(--fg-border);
      border-radius: var(--fg-card-radius);
      padding: 20px;
      text-decoration: none;
      display: block;
      transition: all .2s;

      &:hover { border-color: var(--fg-yellow); box-shadow: var(--fg-shadow-sm); }
    }

    .astuce-icon {
      width: 40px; height: 40px;
      background: var(--fg-yellow-light);
      color: #b8960c;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      margin-bottom: 12px;
    }

    .astuce-titre { font-size: 14.5px; font-weight: 700; color: var(--fg-text); margin-bottom: 6px; }
    .astuce-extrait { font-size: 12.5px; color: var(--fg-text-secondary); line-height: 1.6; }

    // ─── ÉTATS VIDES / LOADING ──────────────────
    .empty-state {
      text-align: center;
      padding: 48px;
      i { font-size: 40px; color: #ddd; display: block; margin-bottom: 10px; }
      p { font-size: 13px; color: #aaa; }
    }

    .loading-row {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }

    .skeleton-card {
      height: 220px;
      border-radius: var(--fg-card-radius);
      background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .home > .section:last-of-type { padding-bottom: 64px; }

    @media (max-width: 768px) {
      .hero { padding: 56px 16px 80px; }
      .hero h1 { font-size: 24px; }
      .search-box { flex-direction: column; }
      .search-btn { padding: 12px; }
      .pub-section { margin-top: -40px; }
      .pub-carousel { aspect-ratio: 16 / 11; }
      .section { padding: 40px 16px 0; }
      .section-head h2 { font-size: 18px; }
    }
  `],
})
export class Home implements OnInit {
  private proService = inject(ProfessionnelService);
  private categorieService = inject(CategorieService);
  private numerosService = inject(NumerosUtilesService);
  private astucesService = inject(AstucesService);
  private publiciteService = inject(PubliciteService);
  private router = inject(Router);

  villes = VILLES;
  motCle = '';
  villeChoisie = '';
  categorieChoisie = '';

  categories = signal<Categorie[]>([]);
  pros = signal<Professionnel[]>([]);
  numeros = signal<NumeroUtile[]>([]);
  astuces = signal<Astuce[]>([]);
  publicites = signal<Publicite[]>([]);

  loadingPros = signal(true);

  private userPos = signal<{ lat: number; lng: number } | null>(null);

  slideActif = signal(0);
  videoMuted = signal(true);
  private autoTimer?: ReturnType<typeof setInterval>;

  topNotees = computed(() => {
    return this.pros()
      .filter((p) => p.nombreAvis > 0)
      .slice()
      .sort((a, b) => b.moyenneNotes - a.moyenneNotes)
      .slice(0, 6);
  });

  prosProches = computed(() => {
    const liste = this.pros();
    const pos = this.userPos();

    if (!pos) return liste.slice(0, 8);

    return liste
      .map((p) => ({
        ...p,
        distance: p.latitude && p.longitude
          ? distanceKm(pos.lat, pos.lng, p.latitude, p.longitude)
          : undefined,
      }))
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
      .slice(0, 8);
  });

  ngOnInit(): void {
    this.categorieService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.categories.set([]),
    });

    this.proService.getAll().subscribe({
      next: (data) => {
        this.pros.set(data);
        this.loadingPros.set(false);
      },
      error: () => this.loadingPros.set(false),
    });

    this.numerosService.getAll().subscribe({
      next: (data) => this.numeros.set(data),
      error: () => this.numeros.set([]),
    });

    this.astucesService.getAll().subscribe({
      next: (data) => this.astuces.set(data.reverse()),
      error: () => this.astuces.set([]),
    });

    this.publiciteService.getActives().subscribe({
      next: (data) => {
        this.publicites.set(data);
        if (data.length > 1) this.startAuto();
      },
      error: () => this.publicites.set([]),
    });

    navigator.geolocation?.getCurrentPosition(
      (pos) => this.userPos.set({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => this.userPos.set(null)
    );
  }

  compteurCategorie(categorieId: number): number {
    return this.pros().filter((p) => p.categorieId === categorieId).length;
  }

  mapIcone(icone: string): string {
    return ICONE_MAP[icone] ?? 'ti-building-store';
  }

  rechercher(): void {
    this.router.navigate(['/carte'], {
      queryParams: {
        q: this.motCle || null,
        ville: this.villeChoisie || null,
        categorieId: this.categorieChoisie || null,
      },
    });
  }

  private startAuto(): void {
    this.stopAuto();
    this.autoTimer = setInterval(() => this.next(), 6000);
  }

  private stopAuto(): void {
    if (this.autoTimer) clearInterval(this.autoTimer);
  }

  pauseAuto(): void {
    this.stopAuto();
  }

  resumeAuto(): void {
    if (this.publicites().length > 1) this.startAuto();
  }

  next(): void {
    const total = this.publicites().length;
    if (total === 0) return;
    this.slideActif.set((this.slideActif() + 1) % total);
    this.videoMuted.set(true);
  }

  goToSlide(i: number): void {
    this.slideActif.set(i);
    this.videoMuted.set(true);
  }

  toggleSon(): void {
    this.videoMuted.update((v) => !v);
    if (!this.videoMuted()) this.stopAuto();
    else this.resumeAuto();
  }
}