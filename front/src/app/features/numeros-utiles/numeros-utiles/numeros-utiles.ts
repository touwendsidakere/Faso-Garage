import { Component, OnInit, signal, computed } from '@angular/core';
import { NumerosUtilesService } from '../../../core/services/api.services';
import { NumeroUtile } from '../../../core/models';

const TYPE_ICONS: Record<string, string> = {
  POLICE: 'ti-shield-check',
  GENDARMERIE: 'ti-shield-lock',
  POMPIERS: 'ti-flame',
  SAMU: 'ti-first-aid-kit',
  URGENCE: 'ti-alert-triangle',
};

const TYPE_LABELS: Record<string, string> = {
  POLICE: 'Police',
  GENDARMERIE: 'Gendarmerie',
  POMPIERS: 'Sapeurs-pompiers',
  SAMU: 'Urgences médicales',
  URGENCE: 'Autres urgences',
};

@Component({
  selector: 'app-numeros-utiles',
  standalone: true,
  imports: [],
  template: `
    <div class="page">

      <!-- ═══════════════ HERO ═══════════════ -->
      <section class="hero">
        <div class="hero-inner">
          <h1>Numéros utiles</h1>
          <p>Les contacts d'urgence essentiels, toujours à portée de main.</p>
        </div>
      </section>

      <!-- ═══════════════ FILTRES ═══════════════ -->
      @if (typesDisponibles().length > 1) {
        <div class="filters-row">
          <div class="type-chip" [class.active]="filtreActif() === ''" (click)="filtreActif.set('')">
            Tous
          </div>
          @for (t of typesDisponibles(); track t) {
            <div class="type-chip" [class.active]="filtreActif() === t" (click)="filtreActif.set(t)">
              {{ mapLabel(t) }}
            </div>
          }
        </div>
      }

      <!-- ═══════════════ CONTENU ═══════════════ -->
      <section class="content">
        @if (loading()) {
          <div class="grid">
            @for (i of [1,2,3,4]; track i) { <div class="skeleton-card"></div> }
          </div>
        } @else if (numerosFiltres().length === 0) {
          <div class="empty-state">
            <i class="ti ti-phone-off"></i>
            <p>Aucun numéro utile disponible pour le moment</p>
          </div>
        } @else {
          <div class="grid">
            @for (n of numerosFiltres(); track n.id) {
              <a class="numero-card" [href]="'tel:' + n.numero">
                <div class="numero-icon">
                  <i class="ti" [class]="mapIcone(n.type)"></i>
                </div>
                <div class="numero-info">
                  <div class="numero-type">{{ mapLabel(n.type) }}</div>
                  <div class="numero-nom">{{ n.nom }}</div>
                  <div class="numero-num">{{ n.numero }}</div>
                </div>
                <div class="numero-call">
                  <i class="ti ti-phone-call"></i>
                </div>
              </a>
            }
          </div>
        }
      </section>

    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; background: var(--fg-bg); min-height: 100vh; }

    .hero {
      background: linear-gradient(135deg, var(--fg-red) 0%, #a01f38 100%);
      padding: 64px 24px 48px;
      text-align: center;
    }

    .hero-inner { max-width: 560px; margin: 0 auto; }

    .hero-logo {
      height: 48px;
      width: auto;
      margin-bottom: 20px;
      filter: brightness(0) invert(1);
    }

    .hero h1 { font-size: 30px; font-weight: 800; color: #fff; margin: 0 0 12px; }
    .hero p { font-size: 14.5px; color: rgba(255,255,255,.9); margin: 0; line-height: 1.6; }

    .filters-row {
      max-width: 1100px;
      margin: -24px auto 0;
      padding: 0 24px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
      position: relative;
      z-index: 2;
    }

    .type-chip {
      background: #fff;
      border: 1.5px solid var(--fg-border);
      border-radius: 999px;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      color: var(--fg-text-secondary);
      cursor: pointer;
      transition: all .2s;
      box-shadow: var(--fg-shadow-sm);

      &.active { background: var(--fg-red); border-color: var(--fg-red); color: #fff; }
      &:hover:not(.active) { border-color: var(--fg-red); color: var(--fg-red); }
    }

    .content {
      max-width: 1100px;
      margin: 0 auto;
      padding: 40px 24px 64px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 18px;
    }

    .numero-card {
      background: #fff;
      border: 1px solid var(--fg-border);
      border-radius: var(--fg-card-radius);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      text-decoration: none;
      transition: all .2s;

      &:hover { border-color: var(--fg-red); box-shadow: var(--fg-shadow-sm); transform: translateY(-2px); }
    }

    .numero-icon {
      width: 52px; height: 52px;
      background: var(--fg-red-light);
      color: var(--fg-red);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .numero-info { flex: 1; min-width: 0; }
    .numero-type {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--fg-text-secondary);
      text-transform: uppercase;
      letter-spacing: .5px;
      margin-bottom: 3px;
    }
    .numero-nom { font-size: 14.5px; font-weight: 700; color: var(--fg-text); margin-bottom: 2px; }
    .numero-num { font-size: 18px; font-weight: 800; color: var(--fg-red); }

    .numero-call {
      width: 40px; height: 40px;
      background: var(--fg-green);
      color: #fff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px;
      flex-shrink: 0;
    }

    .empty-state {
      text-align: center;
      padding: 64px;
      i { font-size: 40px; color: #ddd; display: block; margin-bottom: 10px; }
      p { font-size: 13px; color: #aaa; }
    }

    .skeleton-card {
      height: 92px;
      border-radius: var(--fg-card-radius);
      background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    @media (max-width: 768px) {
      .hero { padding: 48px 16px 36px; }
      .hero h1 { font-size: 22px; }
      .content { padding: 32px 16px 48px; }
    }
  `],
})
export class NumerosUtiles implements OnInit {
  numeros = signal<NumeroUtile[]>([]);
  loading = signal(true);
  filtreActif = signal('');

  typesDisponibles = computed(() => {
    const types = new Set(this.numeros().map((n) => n.type).filter((t): t is string => !!t));
    return Array.from(types);
  });

  numerosFiltres = computed(() => {
    const filtre = this.filtreActif();
    return filtre ? this.numeros().filter((n) => n.type === filtre) : this.numeros();
  });

  constructor(private numerosService: NumerosUtilesService) {}

  ngOnInit(): void {
    this.numerosService.getAll().subscribe({
      next: (data) => {
        this.numeros.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  mapIcone(type: string): string {
    return TYPE_ICONS[type] ?? 'ti-phone';
  }

  mapLabel(type: string): string {
    return TYPE_LABELS[type] ?? type;
  }
}