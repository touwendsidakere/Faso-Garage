import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService, CategorieService, ServiceService } from '../../../core/services/api.services';
import { ProfessionnelService } from '../../../core/services/professionnel.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>{{ today }}</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon green"><i class="ti ti-building-store"></i></div>
          <div>
            <div class="stat-num">{{ nbValides() }}</div>
            <div class="stat-label">Professionnels validés</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow"><i class="ti ti-clock"></i></div>
          <div>
            <div class="stat-num">{{ nbPending() }}</div>
            <div class="stat-label">En attente de validation</div>
          </div>
          @if (nbPending() > 0) {
            <a routerLink="/admin/professionnels" class="stat-action">Traiter →</a>
          }
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><i class="ti ti-users"></i></div>
          <div>
            <div class="stat-num">{{ nbUtilisateurs() ?? '—' }}</div>
            <div class="stat-label">Utilisateurs</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple"><i class="ti ti-category"></i></div>
          <div>
            <div class="stat-num">{{ nbCategories() }}</div>
            <div class="stat-label">Catégories</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><i class="ti ti-list-check"></i></div>
          <div>
            <div class="stat-num">{{ nbServices() }}</div>
            <div class="stat-label">Services</div>
          </div>
        </div>
      </div>

      <div class="quick-links">
        <a routerLink="/admin/professionnels" class="quick-link">
          <i class="ti ti-building-store"></i> Valider des professionnels
        </a>
        <a routerLink="/admin/publicites" class="quick-link">
          <i class="ti ti-ad-2"></i> Gérer les publicités
        </a>
        <a routerLink="/admin/annonce" class="quick-link">
          <i class="ti ti-speakerphone"></i> Modifier le bandeau d'annonce
        </a>
      </div>

      <div class="note-box">
        <i class="ti ti-info-circle"></i>
        <p>Le nombre d'utilisateurs et certaines statistiques dépendent d'endpoints non encore confirmés côté backend — à finaliser avec l'équipe backend.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }
    .page { padding: 28px; max-width: 1100px; }

    .page-header h1 { font-size: 22px; font-weight: 800; color: #fff; margin: 0; }
    .page-header p { font-size: 12.5px; color: rgba(255,255,255,.75); margin: 4px 0 24px; text-transform: capitalize; }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px; margin-bottom: 28px;
    }

    .stat-card {
      background: #fff; border: 1px solid var(--fg-border); border-radius: var(--fg-card-radius);
      padding: 18px; display: flex; align-items: center; gap: 14px; position: relative;
    }

    .stat-icon {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff;
      &.green { background: var(--fg-green); }
      &.yellow { background: #c8a800; }
      &.blue { background: #1a6db5; }
      &.purple { background: #7b3fa0; }
      &.red { background: var(--fg-red); }
    }

    .stat-num { font-size: 24px; font-weight: 800; color: var(--fg-text); }
    .stat-label { font-size: 11.5px; color: var(--fg-text-secondary); }
    .stat-action {
      position: absolute; bottom: 10px; right: 14px;
      font-size: 11px; font-weight: 700; color: var(--fg-red); text-decoration: none;
    }

    .quick-links { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
    .quick-link {
      display: flex; align-items: center; gap: 8px;
      background: #fff; border: 1px solid var(--fg-border); border-radius: 10px;
      padding: 12px 18px; font-size: 13px; font-weight: 600; color: var(--fg-text);
      text-decoration: none; transition: all .15s;
      i { color: var(--fg-green); font-size: 17px; }
      &:hover { border-color: var(--fg-green); }
    }

    .note-box {
      background: var(--fg-yellow-light); border: 1px solid var(--fg-yellow);
      border-radius: 10px; padding: 12px 16px; display: flex; gap: 10px; align-items: flex-start;
      i { color: #a67f00; font-size: 18px; margin-top: 1px; }
      p { font-size: 12px; color: #6b5500; line-height: 1.6; margin: 0; }
    }
  `],
})
export class AdminOverview implements OnInit {
  private adminService = inject(AdminService);
  private proService = inject(ProfessionnelService);
  private categorieService = inject(CategorieService);
  private serviceService = inject(ServiceService);

  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  nbValides = signal(0);
  nbPending = signal(0);
  nbUtilisateurs = signal<number | null>(null);
  nbCategories = signal(0);
  nbServices = signal(0);

  ngOnInit(): void {
    this.proService.getAll().subscribe({
      next: (data) => this.nbValides.set(data.length),
      error: () => this.nbValides.set(0),
    });

    this.adminService.getPending().subscribe({
      next: (data) => this.nbPending.set(data.length),
      error: () => this.nbPending.set(0),
    });

    // TODO: endpoint /admin/utilisateurs non confirmé — dégrade proprement si absent
    this.adminService.getUtilisateurs().subscribe({
      next: (data) => this.nbUtilisateurs.set(data.length),
      error: () => this.nbUtilisateurs.set(null),
    });

    this.categorieService.getAll().subscribe({
      next: (data) => this.nbCategories.set(data.length),
      error: () => this.nbCategories.set(0),
    });

    this.serviceService.getAll().subscribe({
      next: (data) => this.nbServices.set(data.length),
      error: () => this.nbServices.set(0),
    });
  }
}