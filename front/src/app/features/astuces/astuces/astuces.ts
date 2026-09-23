import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AstucesService } from '../../../core/services/api.services';
import { Astuce } from '../../../core/models';

@Component({
  selector: 'app-astuces',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">

      <!-- ═══════════════ HERO ═══════════════ -->
      <section class="hero">
        <div class="hero-inner">
          <h1>Astuces & conseils auto</h1>
          <p>Entretenez votre véhicule et roulez en toute sécurité grâce à nos conseils pratiques.</p>

          <div class="search-box">
            <i class="ti ti-search"></i>
            <input type="text" [(ngModel)]="motCle" placeholder="Rechercher une astuce...">
          </div>
        </div>
      </section>

      <!-- ═══════════════ FILTRES ═══════════════ -->
      @if (categoriesDisponibles().length > 1) {
        <div class="filters-row">
          <div class="cat-chip" [class.active]="filtreActif() === ''" (click)="filtreActif.set('')">
            Toutes
          </div>
          @for (c of categoriesDisponibles(); track c) {
            <div class="cat-chip" [class.active]="filtreActif() === c" (click)="filtreActif.set(c)">
              {{ c }}
            </div>
          }
        </div>
      }

      <!-- ═══════════════ LISTE ═══════════════ -->
      <section class="content">
        @if (loading()) {
          <div class="grid">
            @for (i of [1,2,3,4,5,6]; track i) { <div class="skeleton-card"></div> }
          </div>
        } @else if (astucesFiltrees().length === 0) {
          <div class="empty-state">
            <i class="ti ti-bulb-off"></i>
            <p>Aucune astuce ne correspond à votre recherche</p>
          </div>
        } @else {
          <div class="grid">
            @for (a of astucesFiltrees(); track a.id; let i = $index) {
              <div class="astuce-card" (click)="ouvrirAstuce(i)">
                @if (a.categorie) {
                  <div class="astuce-tag">{{ a.categorie }}</div>
                }
                <div class="astuce-icon"><i class="ti ti-bulb"></i></div>
                <div class="astuce-titre">{{ a.titre }}</div>
                <div class="astuce-extrait">{{ a.contenu }}</div>
                <div class="astuce-footer">
                  <span class="astuce-date">{{ formatDate(a.datePublication) }}</span>
                  <span class="astuce-lire">Lire l'astuce <i class="ti ti-arrow-right"></i></span>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- ═══════════════ MODALE LECTURE ═══════════════ -->
      @if (astuceActive(); as astuce) {
        <div class="modal-overlay" (click)="fermerModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">

            <button class="modal-close" (click)="fermerModal()">
              <i class="ti ti-x"></i>
            </button>

            <div class="modal-header">
              @if (astuce.categorie) {
                <span class="modal-tag">{{ astuce.categorie }}</span>
              }
              <span class="modal-date">{{ formatDate(astuce.datePublication) }}</span>
            </div>

            <h2 class="modal-titre">{{ astuce.titre }}</h2>

            <div class="modal-body">
              <p>{{ astuce.contenu }}</p>
            </div>

            <div class="modal-nav">
              <button class="nav-btn" [disabled]="indexActif() === 0" (click)="precedente()">
                <i class="ti ti-chevron-left"></i> Précédente
              </button>
              <span class="modal-position">{{ indexActif()! + 1 }} / {{ astucesFiltrees().length }}</span>
              <button class="nav-btn" [disabled]="indexActif() === astucesFiltrees().length - 1" (click)="suivante()">
                Suivante <i class="ti ti-chevron-right"></i>
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; background: var(--fg-bg); min-height: 100vh; }

    // ─── HERO ───────────────────────────────────
    .hero {
      background: linear-gradient(135deg, var(--fg-green) 0%, var(--fg-green-dark) 100%);
      padding: 64px 24px 48px;
      text-align: center;
    }

    .hero-inner { max-width: 640px; margin: 0 auto; }

    .hero-logo {
      height: 48px;
      width: auto;
      margin-bottom: 20px;
      filter: brightness(0) invert(1);
    }

    .hero h1 { font-size: 30px; font-weight: 800; color: #fff; margin: 0 0 12px; }
    .hero p { font-size: 14.5px; color: rgba(255,255,255,.85); margin: 0 0 28px; line-height: 1.6; }

    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #fff;
      border-radius: 12px;
      padding: 13px 18px;
      box-shadow: var(--fg-shadow-md);

      i { font-size: 17px; color: #999; }

      input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        color: var(--fg-text);

        &::placeholder { color: #bbb; }
      }
    }

    // ─── FILTRES ────────────────────────────────
    .filters-row {
      max-width: 1100px;
      margin: -20px auto 0;
      padding: 0 24px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
      position: relative;
      z-index: 2;
    }

    .cat-chip {
      background: #fff;
      border: 1.5px solid var(--fg-border);
      border-radius: 999px;
      padding: 9px 18px;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--fg-text-secondary);
      cursor: pointer;
      transition: all .2s;
      box-shadow: var(--fg-shadow-sm);

      &.active { background: var(--fg-green); border-color: var(--fg-green); color: #fff; }
      &:hover:not(.active) { border-color: var(--fg-green); color: var(--fg-green); }
    }

    // ─── CONTENU ────────────────────────────────
    .content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px 64px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .astuce-card {
      background: #fff;
      border: 1px solid var(--fg-border);
      border-radius: var(--fg-card-radius);
      padding: 24px;
      cursor: pointer;
      transition: all .2s;
      position: relative;

      &:hover { border-color: var(--fg-yellow); box-shadow: var(--fg-shadow-sm); transform: translateY(-2px); }
    }

    .astuce-tag {
      position: absolute;
      top: 20px; right: 20px;
      background: var(--fg-green-light);
      color: var(--fg-green-dark);
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
    }

    .astuce-icon {
      width: 44px; height: 44px;
      background: var(--fg-yellow-light);
      color: #b8960c;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      margin-bottom: 16px;
    }

    .astuce-titre { font-size: 15.5px; font-weight: 700; color: var(--fg-text); margin-bottom: 8px; padding-right: 60px; }

    .astuce-extrait {
      font-size: 13px;
      color: var(--fg-text-secondary);
      line-height: 1.7;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 14px;
    }

    .astuce-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 14px;
      border-top: 1px solid var(--fg-border);
    }

    .astuce-date { font-size: 11.5px; color: var(--fg-text-secondary); }

    .astuce-lire {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--fg-green);
      i { font-size: 14px; }
    }

    // ─── ÉTATS ──────────────────────────────────
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

    // ─── MODALE ─────────────────────────────────
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.6);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 2000;
      animation: fadeIn .2s ease;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal-card {
      background: #fff;
      border-radius: 20px;
      max-width: 720px;
      width: 100%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: var(--fg-shadow-md);
      animation: slideUp .25s ease;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-close {
      position: absolute;
      top: 20px; right: 20px;
      width: 36px; height: 36px;
      border-radius: 50%;
      background: var(--fg-bg);
      border: none;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      color: var(--fg-text-secondary);
      transition: background .2s;
      z-index: 2;

      &:hover { background: var(--fg-red-light); color: var(--fg-red); }
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 32px 60px 0 32px;
    }

    .modal-tag {
      background: var(--fg-green-light);
      color: var(--fg-green-dark);
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 999px;
    }

    .modal-date { font-size: 12.5px; color: var(--fg-text-secondary); }

    .modal-titre {
      font-size: 24px;
      font-weight: 800;
      color: var(--fg-text);
      padding: 16px 32px 0;
      margin: 0;
      line-height: 1.35;
    }

    .modal-body {
      padding: 20px 32px 28px;
      overflow-y: auto;
      flex: 1;

      p {
        font-size: 14.5px;
        color: var(--fg-text);
        line-height: 1.8;
        margin: 0;
        white-space: pre-line;
      }
    }

    .modal-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 32px;
      border-top: 1px solid var(--fg-border);
    }

    .nav-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--fg-bg);
      border: 1px solid var(--fg-border);
      color: var(--fg-text);
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      transition: all .2s;

      i { font-size: 15px; }

      &:hover:not(:disabled) { border-color: var(--fg-green); color: var(--fg-green); }
      &:disabled { opacity: .4; cursor: not-allowed; }
    }

    .modal-position { font-size: 12.5px; color: var(--fg-text-secondary); font-weight: 600; }

    @media (max-width: 768px) {
      .hero { padding: 48px 16px 40px; }
      .hero h1 { font-size: 22px; }
      .content { padding: 32px 16px 48px; }

      .modal-overlay { padding: 0; align-items: flex-end; }
      .modal-card { max-height: 92vh; border-radius: 20px 20px 0 0; }
      .modal-header { padding: 24px 56px 0 20px; }
      .modal-titre { font-size: 19px; padding: 12px 20px 0; }
      .modal-body { padding: 16px 20px 24px; }
      .modal-nav { padding: 14px 20px; }
      .nav-btn span { display: none; }
    }
  `],
})
export class Astuces implements OnInit {
  motCle = '';
  filtreActif = signal('');
  astuces = signal<Astuce[]>([]);
  loading = signal(true);
  indexActif = signal<number | null>(null);

  categoriesDisponibles = computed(() => {
    const cats = new Set(
      this.astuces()
        .map((a) => a.categorie)
        .filter((c): c is string => !!c)
    );
    return Array.from(cats);
  });

  astucesFiltrees = computed(() => {
    let liste = this.astuces();

    if (this.filtreActif()) {
      liste = liste.filter((a) => a.categorie === this.filtreActif());
    }

    if (this.motCle.trim()) {
      const s = this.motCle.toLowerCase();
      liste = liste.filter(
        (a) => a.titre.toLowerCase().includes(s) || a.contenu.toLowerCase().includes(s)
      );
    }

    return liste;
  });

  astuceActive = computed(() => {
    const i = this.indexActif();
    return i !== null ? this.astucesFiltrees()[i] ?? null : null;
  });

  constructor(private astucesService: AstucesService) {}

  ngOnInit(): void {
    this.astucesService.getAll().subscribe({
      next: (data) => {
        this.astuces.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ouvrirAstuce(index: number): void {
    this.indexActif.set(index);
  }

  fermerModal(): void {
    this.indexActif.set(null);
  }

  precedente(): void {
    const i = this.indexActif();
    if (i !== null && i > 0) this.indexActif.set(i - 1);
  }

  suivante(): void {
    const i = this.indexActif();
    if (i !== null && i < this.astucesFiltrees().length - 1) this.indexActif.set(i + 1);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}