import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/api.services';

@Component({
  selector: 'app-admin-annonce',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page">
      <h1>Bandeau d'annonce</h1>
      <p class="sub">Le texte saisi ici défile en haut du site, sous le header, sur toutes les pages publiques.</p>

      @if (erreur) { <div class="alert-error">{{ erreur }}</div> }
      @if (succes) { <div class="alert-success">{{ succes }}</div> }

      @if (loading()) {
        <div class="spinner"></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="sauvegarder()" class="form-card">
          <div class="field-group">
            <label>Texte de l'annonce</label>
            <textarea formControlName="texte" rows="3" placeholder="Ex: Faso Garages est maintenant disponible à Bobo-Dioulasso !"></textarea>
          </div>
          <label class="checkbox-row">
            <input type="checkbox" formControlName="actif"> Afficher le bandeau sur le site
          </label>
          <button type="submit" class="btn-save" [disabled]="saving()">
            {{ saving() ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </form>
      }

      <div class="note-box">
        <i class="ti ti-info-circle"></i>
        <p>L'endpoint de gestion du bandeau d'annonce n'est pas encore confirmé côté backend.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }
    .page { padding: 28px; max-width: 560px; }
    h1 { font-size: 20px; font-weight: 800; color: var(--fg-text); margin: 0; }
    .sub { font-size: 12.5px; color: var(--fg-text-secondary); margin: 6px 0 20px; line-height: 1.6; }

    .alert-error { background: var(--fg-red-light); color: var(--fg-red); padding: 10px 14px; border-radius: 8px; font-size: 12px; margin-bottom: 14px; }
    .alert-success { background: var(--fg-green-light); color: var(--fg-green-dark); padding: 10px 14px; border-radius: 8px; font-size: 12px; margin-bottom: 14px; }

    .form-card { background: #fff; border: 1px solid var(--fg-border); border-radius: 12px; padding: 22px; display: flex; flex-direction: column; gap: 16px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-group label { font-size: 11px; font-weight: 600; color: #555; }
    .field-group textarea { border: 1.5px solid var(--fg-border); border-radius: 8px; padding: 10px 12px; font-family: 'Poppins', sans-serif; font-size: 13px; outline: none; resize: none; &:focus { border-color: var(--fg-green); } }
    .checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--fg-text); }

    .btn-save { background: var(--fg-green); color: #fff; border: none; border-radius: 8px; padding: 11px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; &:disabled { opacity: .6; } }

    .spinner { width: 30px; height: 30px; border: 3px solid var(--fg-border); border-top-color: var(--fg-green); border-radius: 50%; animation: spin .7s linear infinite; margin: 32px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .note-box { margin-top: 20px; background: var(--fg-yellow-light); border: 1px solid var(--fg-yellow); border-radius: 10px; padding: 12px 16px; display: flex; gap: 10px;
      i { color: #a67f00; font-size: 16px; } p { font-size: 11.5px; color: #6b5500; margin: 0; line-height: 1.6; } }
  `],
})
export class AdminAnnonce implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  saving = signal(false);
  erreur = '';
  succes = '';

  form: FormGroup = this.fb.group({
    texte: [''],
    actif: [false],
  });

  ngOnInit(): void {
    this.adminService.getAnnonceDefilante().subscribe({
      next: (data) => { this.form.patchValue(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  sauvegarder(): void {
    this.saving.set(true);
    this.erreur = '';
    this.succes = '';

    this.adminService.updateAnnonceDefilante(this.form.value).subscribe({
      next: () => { this.succes = 'Annonce mise à jour !'; this.saving.set(false); },
      error: (err) => { this.erreur = err.error?.erreur ?? 'Erreur.'; this.saving.set(false); },
    });
  }
}