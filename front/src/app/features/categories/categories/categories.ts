import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CategorieService } from '../../../core/services/api.services';
import { ProfessionnelService } from '../../../core/services/professionnel.service';
import { Categorie } from '../../../core/models';

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

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [],
  template: `
    <div class="page">

      <section class="hero">
        <div class="hero-inner">
          <h1>Catégories</h1>
          <p>Parcourez tous les types de professionnels de l'automobile disponibles sur la plateforme.</p>
        </div>
      </section>

      <section class="content">
        @if (loading()) {
          <div class="grid">
            @for (i of [1,2,3,4,5,6]; track i) { <div class="skeleton-card"></div> }
          </div>
        } @else {
          <div class="grid">
            @for (c of categories(); track c.id) {
              <button class="cat-card" (click)="voirEntreprises(c.id)">
                <div class="cat-icon"><i class="ti" [class]="mapIcone(c.icone)"></i></div>
                <div class="cat-name">{{ c.libelle }}</div>
                @if (c.description) {
                  <div class="cat-desc">{{ c.description }}</div>
                }
                <div class="cat-count">{{ compteur(c.id) }} établissement(s)</div>
              </button>
            }
          </div>
        }
      </section>

    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; background: var(--fg-bg); min-height: 100vh; }

    .hero {
      background: linear-gradient(135deg, var(--fg-green) 0%, var(--fg-green-dark) 100%);
      padding: 64px 24px 48px;
      text-align: center;
    }

    .hero-inner { max-width: 560px; margin: 0 auto; }

    .hero h1 { font-size: 30px; font-weight: 800; color: #fff; margin: 0 0 12px; }
    .hero p { font-size: 14.5px; color: rgba(255,255,255,.9); margin: 0; line-height: 1.6; }

    .content {
      max-width: 1100px;
      margin: 0 auto;
      padding: 48px 24px 64px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 18px;
    }

    .cat-card {
      background: #fff;
      border: 1px solid var(--fg-border);
      border-radius: var(--fg-card-radius);
      padding: 26px 20px;
      text-align: center;
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
      transition: all .2s;

      &:hover { border-color: var(--fg-green); box-shadow: var(--fg-shadow-sm); transform: translateY(-2px); }
    }

    .cat-icon {
      width: 56px; height: 56px;
      background: var(--fg-green-light);
      color: var(--fg-green-dark);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 14px;
      font-size: 26px;
    }

    .cat-name { font-size: 15px; font-weight: 700; color: var(--fg-text); margin-bottom: 6px; }
    .cat-desc { font-size: 12px; color: var(--fg-text-secondary); line-height: 1.5; margin-bottom: 10px; }
    .cat-count { font-size: 11.5px; color: var(--fg-green); font-weight: 600; }

    .skeleton-card {
      height: 180px;
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
export class Categories implements OnInit {
  private categorieService = inject(CategorieService);
  private proService = inject(ProfessionnelService);
  private router = inject(Router);

  categories = signal<Categorie[]>([]);
  private prosParCategorie = signal<Record<number, number>>({});
  loading = signal(true);

  ngOnInit(): void {
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.proService.getAll().subscribe({
      next: (data) => {
        const counts: Record<number, number> = {};
        data.forEach((p) => {
          counts[p.categorieId] = (counts[p.categorieId] ?? 0) + 1;
        });
        this.prosParCategorie.set(counts);
      },
      error: () => {},
    });
  }

  compteur(categorieId: number): number {
    return this.prosParCategorie()[categorieId] ?? 0;
  }

  mapIcone(icone: string): string {
    return ICONE_MAP[icone] ?? 'ti-building-store';
  }

  voirEntreprises(categorieId: number): void {
    this.router.navigate(['/toutes-les-entreprises'], { queryParams: { categorieId } });
  }
}