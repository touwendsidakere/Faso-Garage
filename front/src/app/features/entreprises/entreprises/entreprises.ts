import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProfessionnelService } from '../../../core/services/professionnel.service';
import { CategorieService, ServiceService } from '../../../core/services/api.services';
import { Professionnel, Categorie, Service } from '../../../core/models';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';

type TriOption = 'pertinence' | 'proximite' | 'note' | 'nom';

const VILLES = [
  'Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora',
  'Ouahigouya', 'Tenkodogo', "Fada N'Gourma", 'Dédougou',
];

const PAR_PAGE = 12;

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Component({
  selector: 'app-entreprises',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, MediaUrlPipe],
  template: `
    <div class="page">

      <!-- ═══════════════ EN-TÊTE ═══════════════ -->
      <div class="page-header">
        <h1>Toutes les entreprises</h1>
        <p>{{ resultats().length }} établissement(s) trouvé(s)</p>
      </div>

      <!-- ═══════════════ FILTRES ═══════════════ -->
      <div class="filters-bar">
        <div class="filter-field search-field">
          <i class="ti ti-search"></i>
          <input type="text" [(ngModel)]="motCle" placeholder="Rechercher un établissement...">
        </div>

        <div class="filter-field">
          <select [(ngModel)]="villeFiltre">
            <option value="">Toutes les villes</option>
            @for (v of villes; track v) {
              <option [value]="v">{{ v }}</option>
            }
          </select>
        </div>

        <div class="filter-field">
          <select [(ngModel)]="categorieFiltre" (ngModelChange)="onCategorieChange($event)">
            <option value="">Toutes catégories</option>
            @for (c of categories(); track c.id) {
              <option [value]="c.id">{{ c.libelle }}</option>
            }
          </select>
        </div>

        <div class="filter-field">
          <select [(ngModel)]="serviceFiltre" [disabled]="!categorieFiltre">
            <option value="">Tous services</option>
            @for (s of servicesDisponibles(); track s.id) {
              <option [value]="s.id">{{ s.libelle }}</option>
            }
          </select>
        </div>

        <div class="filter-field tri-field">
          <i class="ti ti-arrows-sort"></i>
          <select [(ngModel)]="triActif">
            <option value="pertinence">Pertinence</option>
            <option value="proximite">Les plus proches</option>
            <option value="note">Les plus aimées</option>
            <option value="nom">Nom (A-Z)</option>
          </select>
        </div>

        @if (filtresActifs()) {
          <button class="btn-clear" (click)="reinitialiser()">
            <i class="ti ti-x"></i> Réinitialiser
          </button>
        }
      </div>

      <!-- ═══════════════ RÉSULTATS ═══════════════ -->
      @if (loading()) {
        <div class="grid">
          @for (i of [1,2,3,4,5,6,7,8]; track i) { <div class="skeleton-card"></div> }
        </div>
      } @else if (resultats().length === 0) {
        <div class="empty-state">
          <i class="ti ti-building-off"></i>
          <p>Aucun établissement ne correspond à ces critères</p>
        </div>
      } @else {
        <div class="grid">
          @for (pro of pageActuelle(); track pro.id) {
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
                <div class="pro-cat">{{ pro.categorie }} · {{ pro.ville }}</div>
                <div class="pro-meta">
                  <span class="pro-note">
                    <i class="ti ti-star-filled"></i> {{ pro.moyenneNotes | number:'1.1-1' }}
                    <span class="pro-avis">({{ pro.nombreAvis }})</span>
                  </span>
                </div>
              </div>
            </a>
          }
        </div>

        <!-- ═══════════════ PAGINATION ═══════════════ -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="page-btn" [disabled]="pageActuelleIndex() === 1" (click)="allerPage(pageActuelleIndex() - 1)">
              <i class="ti ti-chevron-left"></i>
            </button>

            @for (p of pagesAffichees(); track p) {
              @if (p === -1) {
                <span class="page-dots">...</span>
              } @else {
                <button class="page-btn" [class.active]="p === pageActuelleIndex()" (click)="allerPage(p)">
                  {{ p }}
                </button>
              }
            }

            <button class="page-btn" [disabled]="pageActuelleIndex() === totalPages()" (click)="allerPage(pageActuelleIndex() + 1)">
              <i class="ti ti-chevron-right"></i>
            </button>
          </div>
        }
      }

    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; background: var(--fg-bg); min-height: 100vh; }

    .page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 40px 24px 64px;
    }

    .page-header {
      margin-bottom: 24px;

      h1 { font-size: 26px; font-weight: 800; color: #fff; margin: 0 0 6px; }
      p { font-size: 13px; color: rgba(255,255,255,.75); margin: 0; }
    }

    // ─── FILTRES ────────────────────────────────
    .filters-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      background: #fff;
      border: 1px solid var(--fg-border);
      border-radius: var(--fg-card-radius);
      padding: 14px;
      margin-bottom: 28px;
    }

    .filter-field {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--fg-bg);
      border-radius: 8px;
      padding: 9px 12px;
      flex: 1;
      min-width: 160px;

      i { font-size: 15px; color: #999; }

      select, input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-family: 'Poppins', sans-serif;
        font-size: 12.5px;
        color: var(--fg-text);
        min-width: 0;
      }
    }

    .search-field { flex: 1.6; }
    .tri-field { flex: 1.2; }

    .btn-clear {
      display: flex;
      align-items: center;
      gap: 5px;
      background: var(--fg-red-light);
      color: var(--fg-red);
      border: none;
      border-radius: 8px;
      padding: 9px 14px;
      font-size: 12px;
      font-weight: 600;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      white-space: nowrap;

      i { font-size: 14px; }
    }

    // ─── GRILLE RÉSULTATS ───────────────────────
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
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

    .pro-meta { display: flex; align-items: center; font-size: 12px; }
    .pro-note {
      display: flex; align-items: center; gap: 3px;
      color: var(--fg-yellow);
      font-weight: 700;
      i { font-size: 13px; }
    }
    .pro-avis { color: var(--fg-text-secondary); font-weight: 400; }

    // ─── ÉTATS VIDES / LOADING ──────────────────
    .empty-state {
      text-align: center;
      padding: 64px;
      i { font-size: 40px; color: #ddd; display: block; margin-bottom: 10px; }
      p { font-size: 13px; color: #aaa; }
    }

    .skeleton-card {
      height: 220px;
      border-radius: var(--fg-card-radius);
      background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    // ─── PAGINATION ─────────────────────────────
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .page-btn {
      min-width: 36px;
      height: 36px;
      padding: 0 8px;
      border-radius: 8px;
      border: 1px solid var(--fg-border);
      background: #fff;
      color: var(--fg-text);
      font-size: 13px;
      font-weight: 600;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover:not(:disabled) { border-color: var(--fg-green); }
      &:disabled { opacity: .4; cursor: not-allowed; }
      &.active { background: var(--fg-green); border-color: var(--fg-green); color: #fff; }
    }

    .page-dots { color: var(--fg-text-secondary); padding: 0 4px; }

    @media (max-width: 768px) {
      .filters-bar { flex-direction: column; }
      .filter-field { min-width: 100%; }
      .page { padding: 24px 16px 48px; }
    }
  `],
})
export class Entreprises implements OnInit {
  private proService = inject(ProfessionnelService);
  private categorieService = inject(CategorieService);
  private serviceService = inject(ServiceService);
  private route = inject(ActivatedRoute);

  villes = VILLES;
  motCle = '';
  villeFiltre = '';
  categorieFiltre = '';
  serviceFiltre = '';
  triActif: TriOption = 'pertinence';

  categories = signal<Categorie[]>([]);
  services = signal<Service[]>([]);
  pros = signal<Professionnel[]>([]);
  loading = signal(true);

  private userPos = signal<{ lat: number; lng: number } | null>(null);
  private pageIndex = signal(1);

  servicesDisponibles = computed(() =>
    this.categorieFiltre
      ? this.services().filter((s) => s.categorie?.id === +this.categorieFiltre)
      : []
  );

  filtresActifs = computed(() =>
    !!(this.motCle || this.villeFiltre || this.categorieFiltre || this.serviceFiltre || this.triActif !== 'pertinence')
  );

  resultats = computed(() => {
    let liste = this.pros().map((p) => {
      const pos = this.userPos();
      const distance = pos && p.latitude && p.longitude
        ? distanceKm(pos.lat, pos.lng, p.latitude, p.longitude)
        : undefined;
      return { ...p, distance };
    });

    if (this.motCle.trim()) {
      const s = this.motCle.toLowerCase();
      liste = liste.filter((p) => p.nomEtablissement.toLowerCase().includes(s));
    }
    if (this.villeFiltre) {
      liste = liste.filter((p) => p.ville === this.villeFiltre);
    }
    if (this.categorieFiltre) {
      liste = liste.filter((p) => p.categorieId === +this.categorieFiltre);
    }
    if (this.serviceFiltre) {
      liste = liste.filter((p) => p.serviceIds?.includes(+this.serviceFiltre));
    }

    switch (this.triActif) {
      case 'proximite':
        liste = liste.slice().sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
        break;
      case 'note':
        liste = liste.slice().sort((a, b) => b.moyenneNotes - a.moyenneNotes);
        break;
      case 'nom':
        liste = liste.slice().sort((a, b) => a.nomEtablissement.localeCompare(b.nomEtablissement));
        break;
      // 'pertinence' : ordre naturel renvoyé par l'API
    }

    return liste;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.resultats().length / PAR_PAGE)));

  pageActuelleIndex = computed(() => Math.min(this.pageIndex(), this.totalPages()));

  pageActuelle = computed(() => {
    const start = (this.pageActuelleIndex() - 1) * PAR_PAGE;
    return this.resultats().slice(start, start + PAR_PAGE);
  });

  pagesAffichees = computed(() => {
    const total = this.totalPages();
    const current = this.pageActuelleIndex();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push(-1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push(-1);
    pages.push(total);

    return pages;
  });

  ngOnInit(): void {
    const categorieIdParam = this.route.snapshot.queryParamMap.get('categorieId');
    if (categorieIdParam) this.categorieFiltre = categorieIdParam;
    
    this.categorieService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.categories.set([]),
    });

    this.serviceService.getAll().subscribe({
      next: (data) => this.services.set(data),
      error: () => this.services.set([]),
    });

    this.proService.getAll().subscribe({
      next: (data) => {
        this.pros.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    navigator.geolocation?.getCurrentPosition(
      (pos) => this.userPos.set({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => this.userPos.set(null)
    );
  }

  onCategorieChange(_: string): void {
    this.serviceFiltre = '';
  }

  allerPage(p: number): void {
    this.pageIndex.set(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  reinitialiser(): void {
    this.motCle = '';
    this.villeFiltre = '';
    this.categorieFiltre = '';
    this.serviceFiltre = '';
    this.triActif = 'pertinence';
    this.pageIndex.set(1);
  }
}