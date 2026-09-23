import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/api.services';
import { Astuce } from '../../../core/models';

@Component({
  selector: 'app-admin-astuces',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Astuces</h1>
        <button class="btn-add" (click)="ouvrirFormulaire()"><i class="ti ti-plus"></i> Nouvelle astuce</button>
      </div>

      @if (showForm()) {
        <div class="form-card">
          <h3>{{ editId() ? "Modifier l'astuce" : 'Nouvelle astuce' }}</h3>
          @if (erreur) { <div class="alert-error">{{ erreur }}</div> }
          <form [formGroup]="form" (ngSubmit)="sauvegarder()">
            <div class="field-group">
              <label>Titre</label>
              <input type="text" formControlName="titre" placeholder="Ex: Vérifier la pression des pneus">
            </div>
            <div class="field-group">
              <label>Contenu</label>
              <textarea formControlName="contenu" rows="4"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="fermerFormulaire()">Annuler</button>
              <button type="submit" class="btn-save" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <div class="spinner"></div>
      } @else {
        <div class="astuces-list">
          @for (a of astuces(); track a.id) {
            <div class="astuce-row">
              <div>
                <div class="astuce-titre">{{ a.titre }}</div>
                <div class="astuce-extrait">{{ a.contenu.slice(0, 130) }}...</div>
              </div>
              <div class="actions">
                <button class="btn-icon" (click)="editer(a)"><i class="ti ti-pencil"></i></button>
                <button class="btn-icon danger" (click)="supprimer(a)"><i class="ti ti-trash"></i></button>
              </div>
            </div>
          }
          @empty { <div class="empty-row">Aucune astuce</div> }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }
    .page { padding: 28px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
    .page-header h1 { font-size: 20px; font-weight: 800; color: #fff; margin: 0; }

    .btn-add { background: var(--fg-green); color: #fff; border: none; border-radius: 8px; padding: 10px 16px; font-size: 12.5px; font-weight: 700; font-family: 'Poppins', sans-serif; cursor: pointer; display: flex; align-items: center; gap: 6px; }

    .form-card { background: #fff; border: 1px solid var(--fg-border); border-radius: 12px; padding: 20px; margin-bottom: 20px; max-width: 500px;
      h3 { font-size: 14px; font-weight: 700; margin: 0 0 14px; color: var(--fg-text); } }
    .alert-error { background: var(--fg-red-light); color: var(--fg-red); padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 10px; }

    form { display: flex; flex-direction: column; gap: 12px; }
    .field-group { display: flex; flex-direction: column; gap: 4px; }
    .field-group label { font-size: 11px; font-weight: 600; color: #555; }
    .field-group input, .field-group textarea {
      border: 1.5px solid var(--fg-border); border-radius: 8px; padding: 9px 12px;
      font-family: 'Poppins', sans-serif; font-size: 12.5px; outline: none; resize: none;
      &:focus { border-color: var(--fg-green); }
    }

    .form-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .btn-cancel { background: var(--fg-bg); border: 1px solid var(--fg-border); border-radius: 8px; padding: 9px 16px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; }
    .btn-save { background: var(--fg-green); color: #fff; border: none; border-radius: 8px; padding: 9px 16px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; &:disabled { opacity: .6; } }

    .astuces-list { display: flex; flex-direction: column; gap: 10px; }
    .astuce-row {
      background: #fff; border: 1px solid var(--fg-border); border-radius: 10px;
      padding: 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .astuce-titre { font-weight: 700; color: var(--fg-text); font-size: 13.5px; margin-bottom: 4px; }
    .astuce-extrait { font-size: 12px; color: var(--fg-text-secondary); }

    .actions { display: flex; gap: 6px; flex-shrink: 0; }
    .btn-icon { width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--fg-border); background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
      i { font-size: 14px; color: #666; } &.danger i { color: var(--fg-red); } &:hover { background: var(--fg-bg); } }

    .empty-row { text-align: center; color: #aaa; padding: 32px; }
    .spinner { width: 30px; height: 30px; border: 3px solid var(--fg-border); border-top-color: var(--fg-green); border-radius: 50%; animation: spin .7s linear infinite; margin: 32px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class AdminAstuces implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  astuces = signal<Astuce[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editId = signal<number | null>(null);
  erreur = '';

  form: FormGroup = this.fb.group({
    titre: ['', Validators.required],
    contenu: ['', Validators.required],
  });

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading.set(true);
    this.adminService.getAstuces().subscribe({
      next: (data) => { this.astuces.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  ouvrirFormulaire(): void {
    this.editId.set(null);
    this.form.reset();
    this.erreur = '';
    this.showForm.set(true);
  }

  editer(a: Astuce): void {
    this.editId.set(a.id);
    this.form.patchValue(a);
    this.erreur = '';
    this.showForm.set(true);
  }

  fermerFormulaire(): void {
    this.showForm.set(false);
  }

  sauvegarder(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.erreur = '';

    const obs = this.editId()
      ? this.adminService.updateAstuce(this.editId()!, this.form.value)
      : this.adminService.createAstuce(this.form.value);

    obs.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.charger(); },
      error: (err) => { this.erreur = err.error?.erreur ?? 'Erreur.'; this.saving.set(false); },
    });
  }

  supprimer(a: Astuce): void {
    if (!confirm(`Supprimer "${a.titre}" ?`)) return;
    this.adminService.deleteAstuce(a.id).subscribe({
      next: () => this.charger(),
      error: () => alert('Erreur lors de la suppression.'),
    });
  }
}