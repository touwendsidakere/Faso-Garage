import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { ProfessionnelService } from '../../../core/services/professionnel.service';
import { AvisService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';
import { Professionnel, Avis } from '../../../core/models';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';

const CATEGORIE_COLORS: Record<number, string> = {
  1: '#289a4f', 2: '#c92946', 3: '#c8a800', 4: '#1a6db5', 5: '#7b3fa0',
};

function waLink(numero: string): string {
  const digits = numero.replace(/\D/g, '');
  return digits.length <= 8 ? `226${digits}` : digits;
}

@Component({
  selector: 'app-professionnel-detail',
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule, RouterLink, MediaUrlPipe],
  template: `
    <div class="detail-page">

      @if (pro()) {
        <!-- ═══════════════ COVER ═══════════════ -->
        <div class="cover">
          @if (pro()!.photoCouverture) {
            <img [src]="pro()!.photoCouverture | mediaUrl" [alt]="pro()!.nomEtablissement" class="cover-img">
          } @else {
            <div class="cover-fallback" [style.background]="coverColor()"></div>
          }
          <div class="cover-overlay"></div>

          <button class="icon-btn back-btn" (click)="router.navigate(['/'])">
            <i class="ti ti-arrow-left"></i>
          </button>
          <div class="cover-actions">
            <button class="icon-btn" (click)="toggleFavori()">
              <i class="ti" [class.ti-heart-filled]="favori" [class.ti-heart]="!favori"></i>
            </button>
            <button class="icon-btn" (click)="partager()">
              <i class="ti ti-share"></i>
            </button>
          </div>
        </div>

        <!-- ═══════════════ HEADER PROFIL ═══════════════ -->
        <div class="profile-row">
          <div class="profile-logo">
            @if (pro()!.logoUrl) {
              <img [src]="pro()!.logoUrl | mediaUrl" [alt]="pro()!.nomEtablissement">
            } @else {
              <div class="logo-fallback" [style.background]="coverColor()">
                {{ initiales(pro()!.nomEtablissement) }}
              </div>
            }
          </div>
          <div class="profile-info">
            <h1>{{ pro()!.nomEtablissement }}</h1>
            <div class="profile-meta">
              <span class="cat-badge">{{ pro()!.categorie }}</span>
              <span class="rating">
                <i class="ti ti-star-filled"></i> {{ pro()!.moyenneNotes | number:'1.1-1' }}
                <span class="rating-count">({{ pro()!.nombreAvis }} avis)</span>
              </span>
              <span class="ville-tag"><i class="ti ti-map-pin"></i> {{ pro()!.ville }}</span>
            </div>
          </div>
        </div>

        <!-- ═══════════════ ACTIONS DE CONTACT ═══════════════ -->
        <div class="contact-actions">
          <a class="action-btn primary" [href]="'tel:' + pro()!.telephone">
            <i class="ti ti-phone"></i> Appeler
          </a>
          @if (pro()!.telephone2) {
            <a class="action-btn outline" [href]="'tel:' + pro()!.telephone2">
              <i class="ti ti-phone"></i> {{ pro()!.telephone2 }}
            </a>
          }
          @if (pro()!.whatsapp) {
            <a class="action-btn whatsapp" [href]="'https://wa.me/' + waLink(pro()!.whatsapp!)" target="_blank">
              <i class="ti ti-brand-whatsapp"></i> WhatsApp
            </a>
          }
          @if (pro()!.whatsapp2) {
            <a class="action-btn whatsapp-outline" [href]="'https://wa.me/' + waLink(pro()!.whatsapp2!)" target="_blank">
              <i class="ti ti-brand-whatsapp"></i> WhatsApp 2
            </a>
          }
          <a class="action-btn danger"
             [href]="'https://maps.google.com/?q=' + pro()!.latitude + ',' + pro()!.longitude"
             target="_blank">
            <i class="ti ti-navigation"></i> Itinéraire
          </a>
        </div>

        <!-- ═══════════════ CONTENU PRINCIPAL ═══════════════ -->
        <div class="content-grid">

          <!-- COLONNE PRINCIPALE -->
          <div class="main-col">

            @if (pro()!.description) {
              <div class="card">
                <div class="card-label">À propos</div>
                <p class="description">{{ pro()!.description }}</p>
              </div>
            }

            @if (pro()!.services?.length) {
              <div class="card">
                <div class="card-label">Services proposés</div>
                <div class="services-chips">
                  @for (s of pro()!.services; track s) {
                    <span class="service-chip">{{ s }}</span>
                  }
                </div>
              </div>
            }

            @if (pro()!.galeriePhotos?.length) {
              <div class="card">
                <div class="card-label">Galerie</div>
                <div class="gallery-grid">
                  @for (photo of pro()!.galeriePhotos!.slice(0, 6); track photo) {
                    <div class="gallery-item">
                      <img [src]="photo | mediaUrl" alt="Photo de l'établissement">
                    </div>
                  }
                </div>
              </div>
            }

            <!-- AVIS -->
            <div class="card">
              <div class="avis-header">
                <div class="avis-score">
                  <span class="avis-big">{{ pro()!.moyenneNotes | number:'1.1-1' }}</span>
                  <div>
                    <div class="stars">{{ starsStr(pro()!.moyenneNotes) }}</div>
                    <div class="avis-sub">{{ pro()!.nombreAvis }} avis</div>
                  </div>
                </div>
                @if (auth.isLoggedIn() && !dejaPoste()) {
                  <button class="btn-avis" (click)="showAvisForm = !showAvisForm">
                    + Laisser un avis
                  </button>
                }
              </div>

              @if (showAvisForm) {
                <form [formGroup]="avisForm" (ngSubmit)="posterAvis()" class="avis-form">
                  <div class="note-selector">
                    @for (n of [1,2,3,4,5]; track n) {
                      <span (click)="avisForm.patchValue({note: n})"
                            [style.color]="n <= (avisForm.get('note')?.value || 0) ? '#f1a800' : '#ddd'"
                            style="font-size:24px;cursor:pointer">★</span>
                    }
                  </div>
                  <textarea formControlName="commentaire" placeholder="Votre avis..." rows="3"
                            class="avis-textarea"></textarea>
                  <button type="submit" class="btn-avis" [disabled]="avisForm.invalid || avisLoading">
                    {{ avisLoading ? 'Envoi...' : 'Publier' }}
                  </button>
                </form>
              }

              @if (avisLoading && avis().length === 0) {
                <div class="spinner"></div>
              }
              @for (a of avis(); track a.id) {
                <div class="avis-card">
                  <div class="avis-top">
                    <div class="avis-avatar">
                      {{ (a.prenomUtilisateur[0] + a.nomUtilisateur[0]).toUpperCase() }}
                    </div>
                    <div class="avis-name">{{ a.prenomUtilisateur }} {{ a.nomUtilisateur[0] }}.</div>
                    <div class="avis-stars">{{ starsStr(a.note) }}</div>
                    <div class="avis-date">{{ formatDate(a.dateCreation) }}</div>
                  </div>
                  <div class="avis-text">{{ a.commentaire }}</div>
                </div>
              }
            </div>

          </div>

          <!-- SIDEBAR -->
          <div class="side-col">

            <div class="card">
              <div class="card-label">Informations pratiques</div>

              <div class="info-row">
                <i class="ti ti-clock"></i>
                <span>{{ pro()!.horaires }}</span>
              </div>

              @if (pro()!.adressePhysique) {
                <div class="info-row">
                  <i class="ti ti-building"></i>
                  <span>{{ pro()!.adressePhysique }}</span>
                </div>
              }

              <div class="info-row">
                <i class="ti ti-map-pin"></i>
                <span>{{ pro()!.ville }}
                  @if (pro()!.distance !== undefined) {
                    — <strong>{{ pro()!.distance | number:'1.1-1' }} km</strong> de vous
                  }
                </span>
              </div>

              <div class="info-row">
                <i class="ti ti-phone"></i>
                <a [href]="'tel:' + pro()!.telephone">{{ pro()!.telephone }}</a>
              </div>

              @if (pro()!.telephone2) {
                <div class="info-row">
                  <i class="ti ti-phone"></i>
                  <a [href]="'tel:' + pro()!.telephone2">{{ pro()!.telephone2 }}</a>
                </div>
              }

              @if (pro()!.whatsapp) {
                <div class="info-row">
                  <i class="ti ti-brand-whatsapp"></i>
                  <a [href]="'https://wa.me/' + waLink(pro()!.whatsapp!)" target="_blank" rel="noopener">{{ pro()!.whatsapp }}</a>
                </div>
              }

              @if (pro()!.whatsapp2) {
                <div class="info-row">
                  <i class="ti ti-brand-whatsapp"></i>
                  <a [href]="'https://wa.me/' + waLink(pro()!.whatsapp2!)" target="_blank" rel="noopener">{{ pro()!.whatsapp2 }}</a>
                </div>
              }

              @if (pro()!.emailPublic) {
                <div class="info-row">
                  <i class="ti ti-mail"></i>
                  <a [href]="'mailto:' + pro()!.emailPublic">{{ pro()!.emailPublic }}</a>
                </div>
              }

              @if (pro()!.siteWeb) {
                <div class="info-row">
                  <i class="ti ti-world"></i>
                  <a [href]="pro()!.siteWeb" target="_blank" rel="noopener">{{ pro()!.siteWeb }}</a>
                </div>
              }
            </div>

            <div class="card map-card">
              <div class="card-label">Localisation</div>
              <div id="mini-map"></div>
              <button class="map-link" (click)="ouvrirCarte()">
                <i class="ti ti-map-2"></i> Voir sur Google Maps
              </button>
            </div>

          </div>
        </div>

      } @else if (loading) {
        <div class="loading-wrap"><div class="spinner"></div></div>
      } @else {
        <div class="not-found">Professionnel introuvable.</div>
      }

    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }

    .detail-page {
      background: var(--fg-bg);
      min-height: 100vh;
      padding-bottom: 64px;
    }

    // ─── COVER ──────────────────────────────────
    .cover {
      width: 100%;
      height: 280px;
      position: relative;
    }

    .cover-img, .cover-fallback {
      width: 100%; height: 100%;
      object-fit: cover;
    }

    .cover-fallback {
      background: linear-gradient(135deg, var(--fg-green), var(--fg-green-dark));
    }

    .cover-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,.15), rgba(0,0,0,.35));
    }

    .icon-btn {
      width: 38px; height: 38px;
      background: rgba(255,255,255,.9);
      border: none;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      i { font-size: 17px; color: #333; }
    }

    .back-btn { position: absolute; top: 20px; left: 20px; }
    .cover-actions { position: absolute; top: 20px; right: 20px; display: flex; gap: 8px; }
    .cover-actions .icon-btn:has(.ti-heart-filled) i { color: var(--fg-red); }

    // ─── PROFIL ─────────────────────────────────
    .profile-row {
      max-width: 1100px;
      margin: -48px auto 0;
      padding: 0 24px;
      display: flex;
      align-items: flex-end;
      gap: 20px;
      position: relative;
      z-index: 2;
    }

    .profile-logo {
      width: 96px; height: 96px;
      border-radius: 18px;
      overflow: hidden;
      border: 4px solid #fff;
      box-shadow: var(--fg-shadow-md);
      flex-shrink: 0;
      background: #fff;

      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .logo-fallback {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 30px; font-weight: 800;
    }

    .profile-info {
      flex: 1;
      padding-bottom: 8px;

      h1 { font-size: 24px; font-weight: 800; color: var(--fg-text); margin: 0 0 8px; }
    }

    .profile-meta {
      display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
    }

    .cat-badge {
      background: var(--fg-green-light);
      color: var(--fg-green-dark);
      font-size: 12px; font-weight: 700;
      padding: 4px 12px; border-radius: 999px;
    }

    .rating {
      display: flex; align-items: center; gap: 4px;
      font-size: 13px; font-weight: 700; color: var(--fg-yellow);
      i { font-size: 14px; }
    }
    .rating-count { color: var(--fg-text-secondary); font-weight: 400; }

    .ville-tag {
      display: flex; align-items: center; gap: 4px;
      font-size: 13px; color: var(--fg-text-secondary);
      i { font-size: 14px; }
    }

    // ─── ACTIONS CONTACT ────────────────────────
    .contact-actions {
      max-width: 1100px;
      margin: 20px auto 0;
      padding: 0 24px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .action-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 11px 18px;
      border-radius: 10px;
      font-size: 13px; font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: opacity .2s;
      i { font-size: 16px; }
      &:hover { opacity: .88; }

      &.primary { background: var(--fg-green); color: #fff; }
      &.outline { background: #fff; color: var(--fg-text); border: 1.5px solid var(--fg-border); }
      &.whatsapp { background: #25D366; color: #fff; }
      &.whatsapp-outline { background: #fff; color: #25D366; border: 1.5px solid #25D366; }
      &.danger { background: var(--fg-red); color: #fff; }
    }

    // ─── CONTENU ────────────────────────────────
    .content-grid {
      max-width: 1100px;
      margin: 0 auto;
      padding: 24px;
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 20px;
    }

    .main-col, .side-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card {
      background: #fff;
      border: 1px solid var(--fg-border);
      border-radius: var(--fg-card-radius);
      padding: 20px;
    }

    .card-label {
      font-size: 12px; font-weight: 700; color: var(--fg-green);
      text-transform: uppercase; letter-spacing: .5px;
      display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
      &::after { content: ''; flex: 1; height: 1px; background: var(--fg-green-light); }
    }

    .description { font-size: 13.5px; color: var(--fg-text); line-height: 1.7; margin: 0; }

    .services-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .service-chip {
      background: var(--fg-bg);
      border: 1px solid var(--fg-border);
      color: var(--fg-text);
      font-size: 12px; font-weight: 600;
      padding: 6px 12px; border-radius: 999px;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .gallery-item {
      aspect-ratio: 1;
      border-radius: 10px;
      overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .info-row {
      display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px;
      &:last-child { margin-bottom: 0; }
      i { font-size: 16px; color: var(--fg-green); margin-top: 1px; flex-shrink: 0; }
      span, a { font-size: 13px; color: var(--fg-text); line-height: 1.5; text-decoration: none; }
      a:hover { text-decoration: underline; }
    }

    .map-card #mini-map {
      width: 100%;
      height: 160px;
      border-radius: 10px;
      margin-bottom: 12px;
    }

    .map-link {
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      background: var(--fg-bg);
      border: 1px solid var(--fg-border);
      border-radius: 8px;
      padding: 10px;
      font-size: 12.5px; font-weight: 600; color: var(--fg-text);
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      i { font-size: 15px; color: var(--fg-green); }
    }

    // ─── AVIS ───────────────────────────────────
    .avis-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .avis-score { display: flex; align-items: baseline; gap: 8px; }
    .avis-big { font-size: 28px; font-weight: 800; color: var(--fg-text); }
    .stars { font-size: 13px; color: var(--fg-yellow); }
    .avis-sub { font-size: 11px; color: var(--fg-text-secondary); }

    .btn-avis {
      background: var(--fg-red); color: #fff; border: none; border-radius: 10px;
      padding: 9px 16px; font-size: 12.5px; font-weight: 700;
      font-family: 'Poppins', sans-serif; cursor: pointer;
      &:disabled { opacity: .6; cursor: not-allowed; }
    }

    .avis-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    .note-selector { display: flex; gap: 4px; }
    .avis-textarea {
      width: 100%; border: 1.5px solid var(--fg-border); border-radius: 10px;
      padding: 12px 14px; font-family: 'Poppins', sans-serif;
      font-size: 13px; outline: none; resize: none;
      &:focus { border-color: var(--fg-green); }
    }

    .avis-card {
      background: var(--fg-bg); border-radius: 10px;
      padding: 12px 14px; margin-bottom: 10px;
      &:last-child { margin-bottom: 0; }
    }
    .avis-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .avis-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: var(--fg-green-light); display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: var(--fg-green-dark); flex-shrink: 0;
    }
    .avis-name { font-size: 12.5px; font-weight: 700; color: var(--fg-text); flex: 1; }
    .avis-stars { font-size: 12px; color: var(--fg-yellow); }
    .avis-date { font-size: 10.5px; color: var(--fg-text-secondary); }
    .avis-text { font-size: 12.5px; color: var(--fg-text-secondary); line-height: 1.6; }

    .spinner {
      width: 32px; height: 32px; border: 3px solid var(--fg-border);
      border-top-color: var(--fg-green); border-radius: 50%;
      animation: spin .7s linear infinite; margin: 16px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .loading-wrap { padding: 80px; text-align: center; }
    .not-found { padding: 80px; text-align: center; color: var(--fg-text-secondary); }

    @media (max-width: 900px) {
      .content-grid { grid-template-columns: 1fr; padding: 16px; }
      .cover { height: 200px; }
      .profile-row { flex-direction: column; align-items: flex-start; margin-top: -40px; padding: 0 16px; }
      .profile-logo { width: 76px; height: 76px; }
      .contact-actions { padding: 0 16px; }
      .gallery-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ProfessionnelDetail implements OnInit, OnDestroy {
  pro = signal<Professionnel | null>(null);
  avis = signal<Avis[]>([]);
  loading = false;
  avisLoading = false;
  favori = false;
  showAvisForm = false;
  dejaPoste = signal(false);
  avisForm: FormGroup;

  private miniMap?: L.Map;
  waLink = waLink;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private proService: ProfessionnelService,
    private avisService: AvisService,
    public auth: AuthService,
    private fb: FormBuilder
  ) {
    this.avisForm = this.fb.group({
      note: [0, [Validators.required, Validators.min(1)]],
      commentaire: ['', Validators.required],
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;

    this.proService.getById(id).subscribe({
      next: (data) => {
        this.pro.set(data);
        this.loading = false;
        setTimeout(() => this.initMiniMap());
      },
      error: () => { this.loading = false; },
    });

    this.avisService.getByPro(id).subscribe({
      next: (data) => this.avis.set(data),
      error: () => {},
    });

    if (this.auth.isLoggedIn()) {
      this.avisService.verifierDejaPoste(id).subscribe({
        next: (v) => this.dejaPoste.set(v),
        error: () => {},
      });
    }
  }

  ngOnDestroy() {
    this.miniMap?.remove();
  }

  private initMiniMap(): void {
    const p = this.pro();
    if (!p || !p.latitude || !p.longitude) return;

    this.miniMap = L.map('mini-map', {
      center: [p.latitude, p.longitude],
      zoom: 15,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.miniMap);

    L.marker([p.latitude, p.longitude]).addTo(this.miniMap);
  }

  posterAvis() {
    if (this.avisForm.invalid) return;
    this.avisLoading = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.avisService.poster({
      professionnelId: id,
      note: this.avisForm.value.note,
      commentaire: this.avisForm.value.commentaire,
    }).subscribe({
      next: () => {
        this.showAvisForm = false;
        this.dejaPoste.set(true);
        this.avisService.getByPro(id).subscribe((data) => this.avis.set(data));
        this.avisLoading = false;
      },
      error: () => { this.avisLoading = false; },
    });
  }

  toggleFavori() { this.favori = !this.favori; }

  ouvrirCarte() {
    const p = this.pro();
    if (p) window.open(`https://maps.google.com/?q=${p.latitude},${p.longitude}`, '_blank');
  }

  partager() {
    if (navigator.share) navigator.share({ title: this.pro()?.nomEtablissement, url: window.location.href });
  }

  initiales(nom: string): string {
    return nom.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  starsStr(note: number): string {
    const full = Math.round(note);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  coverColor(): string {
    return CATEGORIE_COLORS[this.pro()?.categorieId ?? 1] ?? '#289a4f';
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return "aujourd'hui";
    if (diff === 1) return 'il y a 1j';
    return `il y a ${diff}j`;
  }
}