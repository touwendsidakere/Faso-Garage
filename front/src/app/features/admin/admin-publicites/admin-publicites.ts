import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService, FichierService } from '../../../core/services/api.services';
import { Publicite } from '../../../core/models';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';

@Component({
  selector: 'app-admin-publicites',
  standalone: true,
  imports: [ReactiveFormsModule, MediaUrlPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Publicités (carrousel accueil)</h1>
        <button class="btn-add" (click)="ouvrirFormulaire()"><i class="ti ti-plus"></i> Nouvelle publicité</button>
      </div>

      @if (showForm()) {
        <div class="form-card">
          <h3>{{ editId() ? 'Modifier la publicité' : 'Nouvelle publicité' }}</h3>
          @if (erreur) { <div class="alert-error">{{ erreur }}</div> }

          <div class="upload-zone" (click)="fileInput.click()">
            @if (form.value.mediaUrl) {
              @if (form.value.type === 'IMAGE') {
                <img [src]="form.value.mediaUrl | mediaUrl" alt="Aperçu">
              } @else {
                <video [src]="form.value.mediaUrl | mediaUrl" muted></video>
              }
            } @else if (uploading()) {
              <span>Envoi en cours...</span>
            } @else {
              <span><i class="ti ti-cloud-upload"></i> Cliquez pour choisir une image ou une vidéo</span>
            }
          </div>
          <input #fileInput type="file" accept="image/*,video/*" hidden (change)="onFileSelected($event)">

          <form [formGroup]="form" (ngSubmit)="sauvegarder()">
            <div class="row2">
              <div class="field-group">
                <label>Date de début (optionnel)</label>
                <input type="date" formControlName="dateDebut">
              </div>
              <div class="field-group">
                <label>Date de fin (optionnel)</label>
                <input type="date" formControlName="dateFin">
              </div>
            </div>
            <div class="field-group">
              <label>Lien de redirection (optionnel)</label>
              <input type="text" formControlName="lienRedirection" placeholder="https://...">
            </div>
            <label class="checkbox-row">
              <input type="checkbox" formControlName="actif"> Publicité active
            </label>
            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="fermerFormulaire()">Annuler</button>
              <button type="submit" class="btn-save" [disabled]="form.invalid || saving() || !form.value.mediaUrl">
                {{ saving() ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <div class="spinner"></div>
      } @else {
        <div class="pubs-grid">
          @for (p of publicites(); track p.id) {
            <div class="pub-card">
              @if (p.type === 'IMAGE') {
                <img [src]="p.mediaUrl | mediaUrl" alt="Publicité">
              } @else {
                <video [src]="p.mediaUrl | mediaUrl" muted></video>
              }
              <div class="pub-info">
                <span class="pub-statut" [class.actif]="p.actif">{{ p.actif ? 'Active' : 'Inactive' }}</span>
                <div class="actions">
                  <button class="btn-icon" (click)="editer(p)"><i class="ti ti-pencil"></i></button>
                  <button class="btn-icon danger" (click)="supprimer(p)"><i class="ti ti-trash"></i></button>
                </div>
              </div>
            </div>
          }
          @empty { <div class="empty-row">Aucune publicité</div> }
        </div>
      }

      <div class="note-box">
        <i class="ti ti-info-circle"></i>
        <p>Les endpoints de gestion des publicités ne sont pas encore confirmés côté backend — à valider avec l'équipe backend avant mise en production.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }
    .page { padding: 28px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
    .page-header h1 { font-size: 20px; font-weight: 800; color: #fff; margin: 0; }
    .btn-add { background: var(--fg-green); color: #fff; border: none; border-radius: 8px; padding: 10px 16px; font-size: 12.5px; font-weight: 700; font-family: 'Poppins', sans-serif; cursor: pointer; display: flex; align-items: center; gap: 6px; }

    .form-card { background: #fff; border: 1px solid var(--fg-border); border-radius: 12px; padding: 20px; margin-bottom: 20px; max-width: 460px;
      h3 { font-size: 14px; font-weight: 700; margin: 0 0 14px; color: var(--fg-text); } }
    .alert-error { background: var(--fg-red-light); color: var(--fg-red); padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 10px; }

    .upload-zone {
      border: 2px dashed var(--fg-border); border-radius: 10px; height: 140px;
      display: flex; align-items: center; justify-content: center; cursor: pointer; margin-bottom: 14px;
      overflow: hidden; background: var(--fg-bg);
      img, video { width: 100%; height: 100%; object-fit: cover; }
      span { font-size: 12px; color: var(--fg-text-secondary); display: flex; align-items: center; gap: 6px; }
      i { font-size: 20px; color: var(--fg-green); }
    }

    form { display: flex; flex-direction: column; gap: 12px; }
    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .field-group { display: flex; flex-direction: column; gap: 4px; }
    .field-group label { font-size: 11px; font-weight: 600; color: #555; }
    .field-group input { border: 1.5px solid var(--fg-border); border-radius: 8px; padding: 9px 12px; font-family: 'Poppins', sans-serif; font-size: 12.5px; outline: none; &:focus { border-color: var(--fg-green); } }
    .checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--fg-text); }

    .form-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .btn-cancel { background: var(--fg-bg); border: 1px solid var(--fg-border); border-radius: 8px; padding: 9px 16px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; }
    .btn-save { background: var(--fg-green); color: #fff; border: none; border-radius: 8px; padding: 9px 16px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; &:disabled { opacity: .6; } }

    .pubs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .pub-card { background: #fff; border: 1px solid var(--fg-border); border-radius: 12px; overflow: hidden;
      img, video { width: 100%; height: 130px; object-fit: cover; display: block; } }
    .pub-info { padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; }
    .pub-statut { font-size: 10.5px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: var(--fg-red-light); color: var(--fg-red);
      &.actif { background: var(--fg-green-light); color: var(--fg-green-dark); } }

    .actions { display: flex; gap: 6px; }
    .btn-icon { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--fg-border); background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
      i { font-size: 13px; color: #666; } &.danger i { color: var(--fg-red); } &:hover { background: var(--fg-bg); } }

    .empty-row { text-align: center; color: #aaa; padding: 32px; grid-column: 1 / -1; }
    .spinner { width: 30px; height: 30px; border: 3px solid var(--fg-border); border-top-color: var(--fg-green); border-radius: 50%; animation: spin .7s linear infinite; margin: 32px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .note-box { margin-top: 20px; background: var(--fg-yellow-light); border: 1px solid var(--fg-yellow); border-radius: 10px; padding: 12px 16px; display: flex; gap: 10px;
      i { color: #a67f00; font-size: 16px; } p { font-size: 11.5px; color: #6b5500; margin: 0; line-height: 1.6; } }
  `],
})
export class AdminPublicites implements OnInit {
  private adminService = inject(AdminService);
  private fichierService = inject(FichierService);
  private fb = inject(FormBuilder);

  publicites = signal<Publicite[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  uploading = signal(false);
  editId = signal<number | null>(null);
  erreur = '';

  form: FormGroup = this.fb.group({
    mediaUrl: [''],
    type: ['IMAGE'],
    dateDebut: [''],
    dateFin: [''],
    lienRedirection: [''],
    actif: [true],
  });

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading.set(true);
    this.adminService.getPublicites().subscribe({
      next: (data) => { this.publicites.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  ouvrirFormulaire(): void {
    this.editId.set(null);
    this.form.reset({ type: 'IMAGE', actif: true });
    this.erreur = '';
    this.showForm.set(true);
  }

  editer(p: Publicite): void {
    this.editId.set(p.id);
    this.form.patchValue(p);
    this.erreur = '';
    this.showForm.set(true);
  }

  fermerFormulaire(): void {
    this.showForm.set(false);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    this.uploading.set(true);

    this.fichierService.upload(file, 'PUBLICITE').subscribe({
      next: (url) => {
        this.form.patchValue({ mediaUrl: url, type: isVideo ? 'VIDEO' : 'IMAGE' });
        this.uploading.set(false);
      },
      error: () => {
        this.erreur = "Erreur lors de l'envoi du média.";
        this.uploading.set(false);
      },
    });
  }

  sauvegarder(): void {
    if (this.form.invalid || !this.form.value.mediaUrl) return;
    this.saving.set(true);
    this.erreur = '';

    const obs = this.editId()
      ? this.adminService.updatePublicite(this.editId()!, this.form.value)
      : this.adminService.createPublicite(this.form.value);

    obs.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.charger(); },
      error: (err) => { this.erreur = err.error?.erreur ?? 'Erreur.'; this.saving.set(false); },
    });
  }

  supprimer(p: Publicite): void {
    if (!confirm('Supprimer cette publicité ?')) return;
    this.adminService.deletePublicite(p.id).subscribe({
      next: () => this.charger(),
      error: () => alert('Erreur lors de la suppression.'),
    });
  }
}