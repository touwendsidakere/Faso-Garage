import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/api.services';
import { Categorie, Service } from '../../../core/models';

const ICONES_DISPONIBLES = [
  'ti-tool', 'ti-car', 'ti-gas-station', 'ti-bolt', 'ti-shield-check',
  'ti-truck', 'ti-car-crash', 'ti-spray', 'ti-engine', 'ti-battery-charging',
  'ti-tire', 'ti-wash', 'ti-settings', 'ti-license', 'ti-map-pin',
  'ti-building-store', 'ti-parking', 'ti-road', 'ti-first-aid-kit', 'ti-recharging',
];

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Catégories</h1>
        <button class="btn-add" (click)="ouvrirFormulaire()"><i class="ti ti-plus"></i> Nouvelle catégorie</button>
      </div>

      @if (showForm()) {
        <div class="form-card">
          <h3>{{ editId() ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}</h3>
          @if (erreur) { <div class="alert-error">{{ erreur }}</div> }

          <form [formGroup]="form" (ngSubmit)="sauvegarder()">
            <div class="field-group">
              <label>Libellé</label>
              <input type="text" formControlName="libelle" placeholder="Ex: Garage mécanique">
            </div>

            <div class="field-group">
              <label>Description</label>
              <textarea formControlName="description" rows="2" placeholder="Description courte"></textarea>
            </div>

            <div class="field-group">
              <label>Icône</label>
              <div class="icon-grid">
                @for (icone of icones; track icone) {
                  <button type="button" class="icon-option" [class.selected]="form.value.icone === icone"
                          (click)="form.patchValue({ icone })">
                    <i class="ti" [class]="icone"></i>
                  </button>
                }
              </div>
              @if (form.get('icone')?.touched && form.get('icone')?.invalid) {
                <div class="field-error">Choisissez une icône</div>
              }
            </div>

            @if (!editId()) {
              <div class="field-group">
                <label>Services à assigner <span class="required-note">(au moins un obligatoire)</span></label>

                @if (servicesDisponibles().length === 0) {
                  <div class="services-hint">
                    Aucun service disponible. Créez d'abord des services depuis l'onglet "Services".
                  </div>
                } @else {
                  <div class="services-select-grid">
                    @for (s of servicesDisponibles(); track s.id) {
                      <label class="service-chip" [class.checked]="isServiceChoisi(s.id)">
                        <input type="checkbox" hidden [checked]="isServiceChoisi(s.id)" (change)="toggleServiceChoisi(s.id)">
                        {{ s.libelle }}
                      </label>
                    }
                  </div>
                }
                @if (form.get('serviceIds')?.touched && form.get('serviceIds')?.invalid) {
                  <div class="field-error">Sélectionnez au moins un service</div>
                }
              </div>
            }

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
        <div class="categories-grid">
          @for (c of categories(); track c.id) {
            <div class="cat-card">
              <div class="cat-card-header">
                <div class="cat-icon"><i class="ti" [class]="c.icone"></i></div>
                <div class="cat-info">
                  <div class="cat-libelle">{{ c.libelle }}</div>
                  @if (c.description) { <div class="cat-desc">{{ c.description }}</div> }
                </div>
                <div class="cat-actions">
                  <button class="btn-icon" (click)="editer(c)"><i class="ti ti-pencil"></i></button>
                  <button class="btn-icon danger" (click)="supprimer(c)"><i class="ti ti-trash"></i></button>
                </div>
              </div>

              <div class="cat-services">
                @for (s of servicesDe(c.id); track s.id) {
                  <span class="service-chip">
                    {{ s.libelle }}
                    <button type="button" class="chip-remove" (click)="retirerService(c.id, s.libelle, s.id)">
                      <i class="ti ti-x"></i>
                    </button>
                  </span>
                }
                @if (servicesDe(c.id).length === 0) {
                  <span class="no-service">Aucun service</span>
                }
              </div>

              <div class="add-service-row">
                <select [(ngModel)]="serviceASelectionner[c.id]" [ngModelOptions]="{ standalone: true }">
                  <option value="">+ Ajouter un service disponible...</option>
                  @for (s of servicesDisponibles(); track s.id) {
                    <option [value]="s.id">{{ s.libelle }}</option>
                  }
                </select>
                <button class="btn-add-service" (click)="affecterService(c.id)" [disabled]="!serviceASelectionner[c.id]">
                  <i class="ti ti-plus"></i>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }
    .page { padding: 28px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
    .page-header h1 { font-size: 20px; font-weight: 800; color: var(--fg-text); margin: 0; }

    .btn-add {
      background: var(--fg-green); color: #fff; border: none; border-radius: 8px;
      padding: 10px 16px; font-size: 12.5px; font-weight: 700; font-family: 'Poppins', sans-serif;
      cursor: pointer; display: flex; align-items: center; gap: 6px;
    }

    .form-card {
      background: #fff; border: 1px solid var(--fg-border); border-radius: 12px;
      padding: 20px; margin-bottom: 20px; max-width: 480px;
      h3 { font-size: 14px; font-weight: 700; margin: 0 0 14px; color: var(--fg-text); }
    }

    .alert-error { background: var(--fg-red-light); color: var(--fg-red); padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 10px; }

    form { display: flex; flex-direction: column; gap: 14px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-group label { font-size: 11px; font-weight: 600; color: #555; }
    .required-note { font-weight: 400; color: var(--fg-text-secondary); font-size: 10.5px; }
    .field-group input, .field-group textarea {
      border: 1.5px solid var(--fg-border); border-radius: 8px; padding: 9px 12px;
      font-family: 'Poppins', sans-serif; font-size: 12.5px; outline: none; resize: none;
      &:focus { border-color: var(--fg-green); }
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }

    .icon-option {
      aspect-ratio: 1;
      border: 1.5px solid var(--fg-border);
      border-radius: 10px;
      background: var(--fg-bg);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all .15s;

      i { font-size: 18px; color: var(--fg-text-secondary); }

      &:hover { border-color: var(--fg-green); }
      &.selected { background: var(--fg-green); border-color: var(--fg-green); i { color: #fff; } }
    }

    .field-error { font-size: 10.5px; color: var(--fg-red); font-weight: 500; }

    .form-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .btn-cancel { background: var(--fg-bg); border: 1px solid var(--fg-border); border-radius: 8px; padding: 9px 16px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; }
    .btn-save { background: var(--fg-green); color: #fff; border: none; border-radius: 8px; padding: 9px 16px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; &:disabled { opacity: .6; } }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .cat-card {
      background: #fff;
      border: 1px solid var(--fg-border);
      border-radius: 14px;
      padding: 18px;
    }

    .cat-card-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }

    .cat-icon {
      width: 44px; height: 44px;
      background: var(--fg-green-light);
      color: var(--fg-green-dark);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .cat-info { flex: 1; min-width: 0; }
    .cat-libelle { font-size: 14.5px; font-weight: 700; color: var(--fg-text); }
    .cat-desc { font-size: 11.5px; color: var(--fg-text-secondary); margin-top: 2px; }

    .cat-actions { display: flex; gap: 6px; flex-shrink: 0; }
    .btn-icon {
      width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--fg-border); background: #fff;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      i { font-size: 14px; color: #666; }
      &.danger i { color: var(--fg-red); }
      &:hover { background: var(--fg-bg); }
    }

    .cat-services {
      display: flex; flex-wrap: wrap; gap: 6px;
      margin-bottom: 12px;
      min-height: 24px;
    }

    .service-chip {
      background: var(--fg-bg);
      border: 1px solid var(--fg-border);
      color: var(--fg-text);
      font-size: 11px; font-weight: 600;
      padding: 4px 6px 4px 10px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    label.service-chip {
      cursor: pointer;
      transition: all .15s;
      &:hover { border-color: var(--fg-green); }
      &.checked { background: var(--fg-green); border-color: var(--fg-green); color: #fff; }
    }

    .chip-remove {
      width: 16px; height: 16px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--fg-text-secondary);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      padding: 0;

      i { font-size: 10px; }
      &:hover { background: var(--fg-red-light); color: var(--fg-red); }
    }

    .no-service { font-size: 11px; color: #bbb; font-style: italic; }

    .add-service-row {
      display: flex; gap: 6px;
      border-top: 1px solid var(--fg-border);
      padding-top: 12px;

      select {
        flex: 1;
        border: 1.5px solid var(--fg-border);
        border-radius: 8px;
        padding: 8px 10px;
        font-family: 'Poppins', sans-serif;
        font-size: 12px;
        outline: none;
        background: #fff;
        &:focus { border-color: var(--fg-green); }
      }
    }

    .btn-add-service {
      width: 34px; height: 34px;
      background: var(--fg-green);
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      i { font-size: 15px; }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }

    .services-hint {
      font-size: 12px; color: var(--fg-text-secondary); font-style: italic;
      background: var(--fg-bg); border-radius: 8px; padding: 12px;
    }

    .services-select-grid { display: flex; flex-wrap: wrap; gap: 8px; }

    .spinner { width: 30px; height: 30px; border: 3px solid var(--fg-border); border-top-color: var(--fg-green); border-radius: 50%; animation: spin .7s linear infinite; margin: 32px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class AdminCategories implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  categories = signal<Categorie[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editId = signal<number | null>(null);
  erreur = '';
  icones = ICONES_DISPONIBLES;

  servicesDisponibles = signal<Service[]>([]);
  serviceASelectionner: Record<number, string> = {};

  form: FormGroup = this.fb.group({
    libelle: ['', Validators.required],
    description: [''],
    icone: ['', Validators.required],
    serviceIds: [[] as number[], Validators.required],
  });

  ngOnInit(): void {
    this.charger();
    this.chargerServicesDisponibles();
  }

  charger(): void {
    this.loading.set(true);
    this.adminService.getCategories().subscribe({
      next: (data) => { this.categories.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  chargerServicesDisponibles(): void {
    this.adminService.getServicesSansCategorie().subscribe({
      next: (data) => this.servicesDisponibles.set(data),
      error: () => this.servicesDisponibles.set([]),
    });
  }

  servicesDe(categorieId: number): { id: number; libelle: string }[] {
    const cat = this.categories().find((c) => c.id === categorieId);
    return (cat as any)?.services ?? [];
  }

  isServiceChoisi(id: number): boolean {
    const current: number[] = this.form.get('serviceIds')?.value || [];
    return current.includes(id);
  }

  toggleServiceChoisi(id: number): void {
    const control = this.form.get('serviceIds')!;
    const current: number[] = control.value || [];
    control.setValue(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    control.markAsTouched();
  }

  ouvrirFormulaire(): void {
    this.editId.set(null);
    this.form.reset({ serviceIds: [] });
    this.form.get('serviceIds')?.setValidators(Validators.required);
    this.form.get('serviceIds')?.updateValueAndValidity();
    this.erreur = '';
    this.showForm.set(true);
    this.chargerServicesDisponibles();
  }

  editer(c: Categorie): void {
    this.editId.set(c.id);
    this.form.patchValue({ libelle: c.libelle, description: c.description, icone: c.icone });
    this.form.get('serviceIds')?.clearValidators();
    this.form.get('serviceIds')?.updateValueAndValidity();
    this.erreur = '';
    this.showForm.set(true);
  }

  fermerFormulaire(): void {
    this.showForm.set(false);
  }

  sauvegarder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.erreur = '';

    if (this.editId()) {
      this.adminService.updateCategorie(this.editId()!, {
        libelle: this.form.value.libelle,
        description: this.form.value.description,
        icone: this.form.value.icone,
      }).subscribe({
        next: () => { this.saving.set(false); this.showForm.set(false); this.charger(); },
        error: (err) => { this.erreur = err.error?.erreur ?? 'Erreur.'; this.saving.set(false); },
      });
    } else {
      this.adminService.createCategorie({
        libelle: this.form.value.libelle,
        description: this.form.value.description,
        icone: this.form.value.icone,
      }).subscribe({
        next: (nouvelleCategorie: any) => {
          const serviceIds: number[] = this.form.value.serviceIds;
          let restant = serviceIds.length;

          serviceIds.forEach((sid) => {
            this.adminService.affecterServiceACategorie(sid, nouvelleCategorie.id).subscribe({
              next: () => {
                restant--;
                if (restant === 0) {
                  this.saving.set(false);
                  this.showForm.set(false);
                  this.chargerServicesDisponibles();
                  this.charger();
                }
              },
              error: (err) => {
                this.erreur = "Catégorie créée, mais erreur sur l'affectation d'un service : " + (err.error?.erreur ?? '');
                this.saving.set(false);
                this.chargerServicesDisponibles();
                this.charger();
              },
            });
          });
        },
        error: (err) => { this.erreur = err.error?.erreur ?? 'Erreur.'; this.saving.set(false); },
      });
    }
  }

  affecterService(categorieId: number): void {
    const serviceId = +this.serviceASelectionner[categorieId];
    if (!serviceId) return;

    this.adminService.affecterServiceACategorie(serviceId, categorieId).subscribe({
      next: () => {
        this.serviceASelectionner[categorieId] = '';
        this.chargerServicesDisponibles();
        this.charger();
      },
      error: (err) => alert(err.error?.erreur ?? "Erreur lors de l'affectation."),
    });
  }

  retirerService(categorieId: number, serviceLibelle: string, serviceId: number): void {
    if (!confirm(`Retirer le service "${serviceLibelle}" de cette catégorie ?\n\nIl restera disponible pour être affecté à une autre catégorie ensuite.`)) return;

    this.adminService.retirerServiceDeCategorie(serviceId).subscribe({
      next: () => {
        this.chargerServicesDisponibles();
        this.charger();
      },
      error: (err) => alert(err.error?.erreur ?? 'Erreur lors du retrait.'),
    });
  }

  supprimer(c: Categorie): void {
    const nbServices = this.servicesDe(c.id).length;
    const message = nbServices > 0
      ? `Supprimer "${c.libelle}" ?\n\nCela supprimera aussi définitivement ses ${nbServices} service(s) associé(s), et retirera ce(s) service(s) de la liste de tous les professionnels qui les utilisent.\n\nCette action est irréversible.`
      : `Supprimer "${c.libelle}" ?`;

    if (!confirm(message)) return;

    this.adminService.deleteCategorie(c.id).subscribe({
      next: () => {
        this.chargerServicesDisponibles();
        this.charger();
      },
      error: (err) => alert(err.error?.erreur ?? 'Erreur lors de la suppression.'),
    });
  }
}