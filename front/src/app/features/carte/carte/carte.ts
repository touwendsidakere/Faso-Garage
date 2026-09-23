import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import * as L from 'leaflet';
import { ProfessionnelService } from '../../../core/services/professionnel.service';
import { CategorieService } from '../../../core/services/api.services';
import { Professionnel, Categorie } from '../../../core/models';

const PALETTE = ['#289a4f', '#c92946', '#1a6db5', '#c8a800', '#7b3fa0', '#e07b39', '#2ba7a0', '#a83279'];

function colorForCategorie(id: number): string {
  return PALETTE[id % PALETTE.length];
}

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

const VILLES = [
  'Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora',
  'Ouahigouya', 'Tenkodogo', "Fada N'Gourma", 'Dédougou',
];

const NB_PROCHES_DEFAUT = 5;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Component({
  selector: 'app-carte',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink],
  template: `
    <div class="carte-page">

      <!-- ═══════════════ SIDEBAR ═══════════════ -->
      <aside class="sidebar" [class.mobile-open]="sidebarOpenMobile()">
        <div class="sidebar-header">
          <div class="sidebar-top-row">
            <a routerLink="/" class="back-link"><i class="ti ti-arrow-left"></i> Accueil</a>
            <button class="close-mobile" (click)="sidebarOpenMobile.set(false)">
              <i class="ti ti-x"></i>
            </button>
          </div>

          <h2>Établissements</h2>

          <div class="search-field">
            <i class="ti ti-search"></i>
            <input type="text" [(ngModel)]="keyword" placeholder="Rechercher un établissement..."
                   (keyup.enter)="rechercher()">
            @if (keyword) {
              <i class="ti ti-x clear-icon" (click)="clearSearch()"></i>
            }
          </div>

          <div class="filters-row">
            <select [(ngModel)]="villeFiltre">
              <option value="">Toutes les villes</option>
              @for (v of villes; track v) {
                <option [value]="v">{{ v }}</option>
              }
            </select>
            <select [(ngModel)]="categorieFiltre">
              <option value="">Toutes catégories</option>
              @for (c of categories(); track c.id) {
                <option [value]="c.id">{{ c.libelle }}</option>
              }
            </select>
          </div>

          @if (!filtresActifs()) {
            <div class="result-count">📍 {{ NB_PROCHES_DEFAUT }} plus proches de vous</div>
          } @else {
            <div class="result-count">{{ sidebarListe().length }} résultat(s)</div>
          }
        </div>

        <div class="sidebar-list">
          @if (loading()) {
            @for (i of [1,2,3,4,5]; track i) {
              <div class="skeleton-card"></div>
            }
          } @else if (sidebarListe().length === 0) {
            <div class="empty-state">
              <i class="ti ti-map-off"></i>
              <p>Aucun résultat pour ces critères</p>
            </div>
          } @else {
            @for (pro of sidebarListe(); track pro.id) {
              <div class="pro-card" [class.selected]="selectedId() === pro.id" (click)="voirSurCarte(pro)">
                <div class="pro-avatar" [style.background]="colorForCategorie(pro.categorieId)">
                  {{ initiales(pro.nomEtablissement) }}
                </div>
                <div class="pro-info">
                  <div class="pro-name">{{ pro.nomEtablissement }}</div>
                  <div class="pro-cat">{{ pro.categorie }} · {{ pro.ville }}</div>
                  <div class="pro-meta">
                    <span class="pro-note">
                      <i class="ti ti-star-filled"></i> {{ pro.moyenneNotes | number:'1.1-1' }}
                      <span class="pro-avis">({{ pro.nombreAvis }})</span>
                    </span>
                    @if (pro.distance !== undefined) {
                      <span class="pro-dist"><i class="ti ti-map-pin"></i> {{ pro.distance | number:'1.1-1' }} km</span>
                    }
                  </div>
                </div>
                <div class="pro-actions">
                  @if (pro.appelPossible) {
                    <a class="btn-call" [href]="'tel:' + pro.telephone"
                       [style.background]="colorForCategorie(pro.categorieId)"
                       (click)="$event.stopPropagation()">
                      <i class="ti ti-phone"></i>
                    </a>
                  }
                  <a class="btn-detail" [routerLink]="['/professionnel', pro.id]" (click)="$event.stopPropagation()">
                    <i class="ti ti-arrow-right"></i>
                  </a>
                </div>
              </div>
            }
          }
        </div>
      </aside>

      <!-- ═══════════════ CARTE ═══════════════ -->
      <div class="map-wrapper">
        <div id="map"></div>
        <button class="locate-btn" (click)="recentrer()" title="Ma position">
          <i class="ti ti-current-location"></i>
        </button>
      </div>

      <!-- Bouton mobile pour ouvrir la liste -->
      <button class="mobile-list-toggle" (click)="sidebarOpenMobile.set(true)">
        <i class="ti ti-list"></i> Liste ({{ sidebarListe().length }})
      </button>

    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }

    .carte-page {
      width: 100%;
      height: calc(100vh - 72px);
      display: flex;
      position: relative;
      overflow: hidden;
    }

    // ─── SIDEBAR ────────────────────────────────
    .sidebar {
      width: 400px;
      flex-shrink: 0;
      background: #fff;
      border-right: 1px solid var(--fg-border);
      display: flex;
      flex-direction: column;
      z-index: 10;
    }

    .sidebar-header {
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--fg-border);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sidebar-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .back-link {
      display: flex; align-items: center; gap: 5px;
      font-size: 12.5px; font-weight: 600;
      color: var(--fg-text-secondary);
      text-decoration: none;

      &:hover { color: var(--fg-green); }
      i { font-size: 15px; }
    }

    .close-mobile { display: none; background: none; border: none; font-size: 20px; cursor: pointer; color: var(--fg-text-secondary); }

    .sidebar-header h2 {
      font-size: 19px;
      font-weight: 800;
      color: var(--fg-text);
      margin: 0;
    }

    .search-field {
      display: flex; align-items: center; gap: 8px;
      background: var(--fg-bg);
      border-radius: 10px;
      padding: 10px 12px;

      i { font-size: 15px; color: #999; }
      .clear-icon { cursor: pointer; }

      input {
        flex: 1; border: none; outline: none; background: transparent;
        font-family: 'Poppins', sans-serif; font-size: 13px; color: var(--fg-text);
      }
    }

    .filters-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;

      select {
        border: 1px solid var(--fg-border);
        border-radius: 8px;
        padding: 8px 10px;
        font-family: 'Poppins', sans-serif;
        font-size: 12px;
        color: var(--fg-text);
        background: #fff;
      }
    }

    .result-count {
      font-size: 12px;
      font-weight: 600;
      color: var(--fg-green);
    }

    .sidebar-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .pro-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 12px;
      border: 1.5px solid transparent;
      cursor: pointer;
      transition: all .15s;

      &:hover { background: var(--fg-bg); }
      &.selected { background: var(--fg-green-light); border-color: var(--fg-green); }
    }

    .pro-avatar {
      width: 44px; height: 44px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0;
    }

    .pro-info { flex: 1; min-width: 0; }
    .pro-name { font-size: 13px; font-weight: 700; color: var(--fg-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pro-cat { font-size: 11.5px; color: var(--fg-text-secondary); margin: 2px 0 4px; }

    .pro-meta { display: flex; align-items: center; gap: 10px; }
    .pro-note { display: flex; align-items: center; gap: 3px; font-size: 11.5px; font-weight: 700; color: var(--fg-yellow); i { font-size: 12px; } }
    .pro-avis { color: var(--fg-text-secondary); font-weight: 400; }
    .pro-dist { display: flex; align-items: center; gap: 2px; font-size: 11px; color: var(--fg-green); font-weight: 600; i { font-size: 11px; } }

    .pro-actions { display: flex; flex-direction: column; gap: 6px; }

    .btn-call, .btn-detail {
      width: 30px; height: 30px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      text-decoration: none; color: #fff; font-size: 14px;
    }

    .btn-detail { background: var(--fg-bg); color: var(--fg-text-secondary); }

    .empty-state {
      text-align: center; padding: 40px 16px;
      i { font-size: 36px; color: #ddd; display: block; margin-bottom: 8px; }
      p { font-size: 12.5px; color: #aaa; }
    }

    .skeleton-card {
      height: 74px;
      border-radius: 12px;
      background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    // ─── CARTE ──────────────────────────────────
    .map-wrapper {
      flex: 1;
      position: relative;
    }

    #map { width: 100%; height: 100%; }

    .locate-btn {
      position: absolute;
      bottom: 20px; right: 20px;
      width: 44px; height: 44px;
      background: #fff;
      border: none;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: var(--fg-shadow-md);
      cursor: pointer;
      z-index: 500;
      i { font-size: 20px; color: var(--fg-green); }
    }

    .mobile-list-toggle {
      display: none;
    }

    // ─── RESPONSIVE ─────────────────────────────
    @media (max-width: 900px) {
      .carte-page { height: calc(100vh - 64px); }

      .sidebar {
        position: fixed;
        left: 0; right: 0; bottom: 0; top: auto;
        width: 100%;
        height: 75vh;
        border-right: none;
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -4px 24px rgba(0,0,0,.15);
        transform: translateY(100%);
        transition: transform .3s ease;
        z-index: 1000;

        &.mobile-open { transform: translateY(0); }
      }

      .close-mobile { display: block; }

      .mobile-list-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        position: absolute;
        bottom: 20px; left: 50%;
        transform: translateX(-50%);
        background: var(--fg-text);
        color: #fff;
        border: none;
        border-radius: 999px;
        padding: 12px 22px;
        font-size: 13px;
        font-weight: 700;
        font-family: 'Poppins', sans-serif;
        box-shadow: var(--fg-shadow-md);
        z-index: 500;
        cursor: pointer;
      }
    }
  `],
})
export class Carte implements OnInit, OnDestroy {
  private proService = inject(ProfessionnelService);
  private categorieService = inject(CategorieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private map!: L.Map;
  private markers = new Map<number, L.Marker>();
  private userMarker?: L.CircleMarker;

  villes = VILLES;
  keyword = '';
  villeFiltre = '';
  categorieFiltre = '';
  NB_PROCHES_DEFAUT = NB_PROCHES_DEFAUT;

  pros = signal<Professionnel[]>([]);
  categories = signal<Categorie[]>([]);
  loading = signal(true);
  selectedId = signal<number | null>(null);
  sidebarOpenMobile = signal(false);
  private userPos = signal<{ lat: number; lng: number } | null>(null);

  colorForCategorie = colorForCategorie;

  filtresActifs = computed(() => !!(this.keyword || this.villeFiltre || this.categorieFiltre));

  // Liste utilisée pour les pins sur la carte : tout ce qui correspond aux filtres actifs
  prosAffiches = computed(() => {
    let liste = this.pros();
    if (this.villeFiltre) {
      liste = liste.filter((p) => p.ville === this.villeFiltre);
    }
    if (this.categorieFiltre) {
      liste = liste.filter((p) => p.categorieId === +this.categorieFiltre);
    }
    return liste;
  });

  // Liste utilisée dans la sidebar : 5 plus proches par défaut, ou tout le filtré si recherche/filtre actif
  sidebarListe = computed(() => {
    const pos = this.userPos();
    const avecDistance = this.prosAffiches().map((p) => ({
      ...p,
      distance: pos && p.latitude && p.longitude
        ? distanceKm(pos.lat, pos.lng, p.latitude, p.longitude)
        : p.distance,
    }));

    if (this.filtresActifs()) {
      return avecDistance;
    }

    // Par défaut : 5 plus proches (ou les 5 premiers si pas de position connue)
    const triee = pos
      ? avecDistance.slice().sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
      : avecDistance;

    return triee.slice(0, NB_PROCHES_DEFAUT);
  });

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.keyword = params.get('q') ?? '';
    this.villeFiltre = params.get('ville') ?? '';
    this.categorieFiltre = params.get('categorieId') ?? '';

    this.categorieService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.categories.set([]),
    });

    setTimeout(() => this.initMap());

    if (this.keyword) {
      this.rechercher();
    } else {
      this.chargerPros();
    }

    this.localiserUtilisateur();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [12.3647, -1.5353],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    L.control.zoom({ position: 'topright' }).addTo(this.map);

    if (this.pros().length) this.placerMarkers(this.prosAffiches());
  }

  private chargerPros(): void {
    this.loading.set(true);
    this.proService.getAll().subscribe({
      next: (data) => {
        this.pros.set(data);
        this.loading.set(false);
        if (this.map) this.placerMarkers(this.prosAffiches());
      },
      error: () => {
        this.pros.set([]);
        this.loading.set(false);
      },
    });
  }

  private placerMarkers(pros: Professionnel[]): void {
    this.markers.forEach((m) => m.remove());
    this.markers.clear();

    pros.forEach((pro) => {
      if (!pro.latitude || !pro.longitude) return;

      const color = colorForCategorie(pro.categorieId);
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            background:${color};color:#fff;
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);display:flex;align-items:center;
            justify-content:center;border:3px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,.25);
          ">
            <span style="transform:rotate(45deg);font-size:11px;font-weight:700">
              ${escapeHtml(this.initiales(pro.nomEtablissement))}
            </span>
          </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([pro.latitude, pro.longitude], { icon })
        .addTo(this.map)
        .bindPopup(`
          <strong>${escapeHtml(pro.nomEtablissement)}</strong><br>
          ${escapeHtml(pro.categorie ?? '')}<br>
          <small>⭐ ${pro.moyenneNotes} · ${pro.nombreAvis} avis</small>
        `);

      marker.on('click', () => this.selectedId.set(pro.id));
      this.markers.set(pro.id, marker);
    });
  }

  private localiserUtilisateur(): void {
    navigator.geolocation?.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      this.userPos.set({ lat: latitude, lng: longitude });

      if (!this.map) return;
      this.userMarker = L.circleMarker([latitude, longitude], {
        radius: 8, color: '#4285F4', fillColor: '#4285F4',
        fillOpacity: 0.9, weight: 3,
      }).addTo(this.map).bindPopup('Votre position');
    });
  }

  rechercher(): void {
    if (!this.keyword.trim()) {
      this.chargerPros();
      return;
    }
    this.loading.set(true);
    this.proService.search(this.keyword).subscribe({
      next: (data) => {
        this.pros.set(data);
        this.loading.set(false);
        if (this.map) this.placerMarkers(this.prosAffiches());
      },
      error: () => this.loading.set(false),
    });
  }

  clearSearch(): void {
    this.keyword = '';
    this.chargerPros();
  }

  voirSurCarte(pro: Professionnel): void {
    this.selectedId.set(pro.id);
    if (pro.latitude && pro.longitude) {
      this.map.flyTo([pro.latitude, pro.longitude], 15, { duration: 0.6 });
      this.markers.get(pro.id)?.openPopup();
    }
    this.sidebarOpenMobile.set(false);
  }

  recentrer(): void {
    navigator.geolocation?.getCurrentPosition((pos) => {
      this.map.setView([pos.coords.latitude, pos.coords.longitude], 14);
    });
  }

  initiales(nom: string): string {
    return nom.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }
}