import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-abonnements',
  standalone: true,
  imports: [],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Abonnements</h1>
      </div>

      <div class="empty-state">
        <i class="ti ti-credit-card"></i>
        <div class="empty-title">Bientôt disponible</div>
        <div class="empty-text">La gestion des abonnements des professionnels sera ajoutée ici.</div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }
    .page { padding: 28px; }
    .page-header { margin-bottom: 18px; }
    .page-header h1 { font-size: 20px; font-weight: 800; color: var(--fg-text); margin: 0; }

    .empty-state {
      background: #fff; border: 1px dashed var(--fg-border); border-radius: 12px;
      padding: 48px 24px; text-align: center;
      i { font-size: 32px; color: #ccc; margin-bottom: 10px; display: block; }
    }
    .empty-title { font-size: 14px; font-weight: 700; color: var(--fg-text); margin-bottom: 4px; }
    .empty-text { font-size: 12px; color: var(--fg-text-secondary); }
  `],
})
export class AdminAbonnements {}