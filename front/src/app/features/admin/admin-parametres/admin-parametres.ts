import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-admin-parametres',
  standalone: true,
  imports: [],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Paramètres</h1>
      </div>

      <div class="section-card">
        <div class="section-header">
          <i class="ti ti-sun-moon"></i>
          <div>
            <div class="section-title">Apparence</div>
            <div class="section-desc">Choisissez le thème d'affichage de l'interface.</div>
          </div>
        </div>
        <div class="choice-group">
          <button
            class="choice-btn"
            [class.active]="theme() === 'clair'"
            (click)="theme.set('clair')">
            <i class="ti ti-sun"></i> Clair
          </button>
          <button
            class="choice-btn"
            [class.active]="theme() === 'sombre'"
            (click)="theme.set('sombre')">
            <i class="ti ti-moon"></i> Sombre
          </button>
        </div>
        <div class="soon-badge">Bientôt fonctionnel</div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <i class="ti ti-language"></i>
          <div>
            <div class="section-title">Langue</div>
            <div class="section-desc">Choisissez la langue de l'interface d'administration.</div>
          </div>
        </div>
        <div class="choice-group">
          <button
            class="choice-btn"
            [class.active]="langue() === 'fr'"
            (click)="langue.set('fr')">
            🇫🇷 Français
          </button>
          <button
            class="choice-btn"
            [class.active]="langue() === 'en'"
            (click)="langue.set('en')">
            🇬🇧 English
          </button>
        </div>
        <div class="soon-badge">Bientôt fonctionnel</div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }
    .page { padding: 28px; max-width: 640px; }
    .page-header { margin-bottom: 18px; }
    .page-header h1 { font-size: 20px; font-weight: 800; color: var(--fg-text); margin: 0; }

    .section-card {
      background: #fff; border: 1px solid var(--fg-border); border-radius: 12px;
      padding: 20px; margin-bottom: 16px;
    }

    .section-header {
      display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;
      i { font-size: 22px; color: var(--fg-green); margin-top: 2px; }
    }
    .section-title { font-size: 14px; font-weight: 700; color: var(--fg-text); margin-bottom: 2px; }
    .section-desc { font-size: 12px; color: var(--fg-text-secondary); }

    .choice-group { display: flex; gap: 8px; }
    .choice-btn {
      display: flex; align-items: center; gap: 6px;
      border: 1.5px solid var(--fg-border); background: #fff; border-radius: 8px;
      padding: 9px 16px; font-size: 12.5px; font-weight: 600; font-family: 'Poppins', sans-serif;
      color: var(--fg-text-secondary); cursor: pointer;
      i { font-size: 15px; }
      &:hover { background: var(--fg-bg); }
      &.active {
        border-color: var(--fg-green); background: var(--fg-green-light); color: var(--fg-green-dark);
      }
    }

    .soon-badge {
      margin-top: 12px; display: inline-block;
      background: var(--fg-yellow-light); color: #8a6a00;
      font-size: 10.5px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
    }
  `],
})
export class AdminParametres {
  theme = signal<'clair' | 'sombre'>('clair');
  langue = signal<'fr' | 'en'>('fr');
}