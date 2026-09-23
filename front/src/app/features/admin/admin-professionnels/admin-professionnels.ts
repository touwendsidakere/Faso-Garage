import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/api.services';
import { ProfessionnelService } from '../../../core/services/professionnel.service';
import { Professionnel } from '../../../core/models';

const COLORS: Record<number, string> = {
  1: '#289a4f', 2: '#c92946', 3: '#c8a800', 4: '#1a6db5', 5: '#7b3fa0',
};

@Component({
  selector: 'app-admin-professionnels',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Professionnels</h1>
        <div class="search-box">
          <i class="ti ti-search"></i>
          <input type="text" placeholder="Rechercher..." [(ngModel)]="searchTerm">
        </div>
      </div>

      <div class="filter-tabs">
        <div class="ftab" [class.active]="filtre === 'PENDING'" (click)="filtre = 'PENDING'">
          En attente ({{ pending().length }})
        </div>
        <div class="ftab" [class.active]="filtre === 'VALIDE'" (click)="filtre = 'VALIDE'">
          Validés ({{ valides().length }})
        </div>
      </div>

      @if (filtre === 'PENDING' && pending().length === 0 && !loadingPending()) {
        <div class="empty-state"><i class="ti ti-check"></i><p>Aucun professionnel en attente</p></div>
      } @else if (loading()) {
        <div class="spinner"></div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Établissement</th>
              <th>Catégorie</th>
              <th>Ville</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (pro of prosFiltres(); track pro.id) {
              <tr>
                <td>
                  <div class="pro-cell">
                    <div class="pro-av" [style.background]="avatarColor(pro.categorieId)">{{ initiales(pro.nomEtablissement) }}</div>
                    <div>
                      <div class="pro-cell-name">{{ pro.nomEtablissement }}</div>
                      <div class="pro-cell-sub">{{ pro.prenomProprietaire }} {{ pro.nomProprietaire }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ pro.categorie }}</td>
                <td>{{ pro.ville }}</td>
                <td>
                  <span class="statut-badge" [class]="statutClass(pro.statut)">{{ statutLabel(pro.statut) }}</span>
                </td>
                <td>
                  <div class="actions">
                    @if (pro.statut === 'PENDING') {
                      <button class="btn-valider" (click)="valider(pro, true)"><i class="ti ti-check"></i> Valider</button>
                      <button class="btn-rejeter" (click)="valider(pro, false)"><i class="ti ti-x"></i> Rejeter</button>
                    }
                    <button class="btn-voir" (click)="router.navigate(['/professionnel', pro.id])">Voir</button>
                  </div>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="5" class="empty-row">Aucun résultat</td></tr>
            }
          </tbody>
        </table>
      }

      <div class="note-box">
        <i class="ti ti-info-circle"></i>
        <p>L'onglet "Rejetés" et la modification/suppression directe d'un établissement dépendent d'endpoints non encore confirmés côté backend.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }
    .page { padding: 28px; }

    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
    .page-header h1 { font-size: 20px; font-weight: 800; color: #fff; margin: 0; }

    .search-box {
      display: flex; align-items: center; gap: 8px;
      background: #fff; border: 1px solid var(--fg-border); border-radius: 8px; padding: 8px 14px;
      i { font-size: 15px; color: #aaa; }
      input { border: none; outline: none; background: transparent; font-family: 'Poppins', sans-serif; font-size: 12.5px; width: 200px; }
    }

    .filter-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
    .ftab {
      font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 20px;
      cursor: pointer; border: 1px solid var(--fg-border); color: #666; background: #fff;
      &.active { background: var(--fg-green); color: #fff; border-color: var(--fg-green); }
    }

    table { width: 100%; border-collapse: collapse; font-size: 12.5px; background: #fff; border-radius: 10px; overflow: hidden; }
    thead tr { background: var(--fg-bg); }
    th { text-align: left; padding: 12px; font-size: 10px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: .5px; }
    td { padding: 12px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }

    .pro-cell { display: flex; align-items: center; gap: 10px; }
    .pro-av { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .pro-cell-name { font-weight: 700; color: var(--fg-text); }
    .pro-cell-sub { font-size: 10.5px; color: var(--fg-text-secondary); }

    .statut-badge {
      font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px;
      &.pending { background: var(--fg-yellow-light); color: #8a6a00; }
      &.valide { background: var(--fg-green-light); color: #1a7a3a; }
      &.rejete { background: var(--fg-red-light); color: #9a1a2e; }
    }

    .actions { display: flex; gap: 6px; }
    .btn-valider, .btn-rejeter, .btn-voir {
      border: none; border-radius: 6px; padding: 6px 11px; font-size: 10.5px; font-weight: 700;
      font-family: 'Poppins', sans-serif; cursor: pointer; display: flex; align-items: center; gap: 3px;
      i { font-size: 13px; }
    }
    .btn-valider { background: var(--fg-green); color: #fff; }
    .btn-rejeter { background: var(--fg-red-light); color: var(--fg-red); border: 1px solid #f6c9d1; }
    .btn-voir { background: var(--fg-bg); color: #555; }

    .empty-state, .empty-row { text-align: center; padding: 40px; color: #aaa; font-size: 13px; }
    .empty-state i { font-size: 32px; color: var(--fg-green); display: block; margin-bottom: 8px; }

    .spinner {
      width: 30px; height: 30px; border: 3px solid var(--fg-border); border-top-color: var(--fg-green);
      border-radius: 50%; animation: spin .7s linear infinite; margin: 32px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .note-box {
      margin-top: 18px; background: var(--fg-yellow-light); border: 1px solid var(--fg-yellow);
      border-radius: 10px; padding: 12px 16px; display: flex; gap: 10px;
      i { color: #a67f00; font-size: 16px; }
      p { font-size: 11.5px; color: #6b5500; margin: 0; line-height: 1.6; }
    }
  `],
})
export class AdminProfessionnels implements OnInit {
  private adminService = inject(AdminService);
  private proService = inject(ProfessionnelService);
  router = inject(Router);

  pendingList = signal<Professionnel[]>([]);
  validesList = signal<Professionnel[]>([]);
  loadingPending = signal(true);
  loadingValides = signal(true);
  filtre = 'PENDING';
  searchTerm = '';

  loading = computed(() => this.loadingPending() || this.loadingValides());
  pending = computed(() => this.pendingList());
  valides = computed(() => this.validesList());

  prosFiltres = computed(() => {
    let liste = this.filtre === 'PENDING' ? this.pending() : this.valides();
    if (this.searchTerm) {
      const s = this.searchTerm.toLowerCase();
      liste = liste.filter((p) => p.nomEtablissement.toLowerCase().includes(s) || p.ville.toLowerCase().includes(s));
    }
    return liste;
  });

  ngOnInit(): void {
    this.adminService.getPending().subscribe({
      next: (data) => { this.pendingList.set(data); this.loadingPending.set(false); },
      error: () => this.loadingPending.set(false),
    });

    this.proService.getAll().subscribe({
      next: (data) => { this.validesList.set(data); this.loadingValides.set(false); },
      error: () => this.loadingValides.set(false),
    });
  }

  valider(pro: Professionnel, ok: boolean): void {
    this.adminService.valider(pro.id, ok).subscribe({
      next: () => {
        this.pendingList.update((list) => list.filter((p) => p.id !== pro.id));
        if (ok) this.validesList.update((list) => [...list, { ...pro, statut: 'VALIDE' }]);
      },
      error: () => alert('Erreur lors de la validation.'),
    });
  }

  initiales(nom: string): string {
    return nom.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  avatarColor(categorieId: number): string {
    return COLORS[categorieId] ?? '#289a4f';
  }

  statutClass(statut: string): string {
    if (statut === 'VALIDE') return 'valide';
    if (statut === 'REJECTED') return 'rejete';
    return 'pending';
  }

  statutLabel(statut: string): string {
    if (statut === 'VALIDE') return '✓ Validé';
    if (statut === 'REJECTED') return '✗ Rejeté';
    return '⏳ En attente';
  }
}