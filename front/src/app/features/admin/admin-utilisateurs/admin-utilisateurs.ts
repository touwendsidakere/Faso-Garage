import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AdminService, CategorieService, ServiceService } from '../../../core/services/api.services';
import { PhoneInput } from '../../../shared/components/phone-input/phone-input';
import { Categorie, Service } from '../../../core/models';

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  role: string;
}

const VILLES = [
  'Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora',
  'Ouahigouya', 'Tenkodogo', "Fada N'Gourma", 'Dédougou',
];

@Component({
  selector: 'app-admin-utilisateurs',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, PhoneInput],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Utilisateurs</h1>
        <div class="header-actions">
          <div class="search-box">
            <i class="ti ti-search"></i>
            <input type="text" placeholder="Rechercher..." [(ngModel)]="searchTerm">
          </div>
          <button class="btn-add" (click)="ouvrirFormulaire()"><i class="ti ti-plus"></i> Nouveau compte</button>
        </div>
      </div>

      @if (showForm()) {
        <div class="form-card">
          <h3>Créer un compte</h3>
          @if (erreur) { <div class="alert-error">{{ erreur }}</div> }
          @if (succes) { <div class="alert-success">{{ succes }}</div> }

          <div class="role-selector">
            <button type="button" class="role-btn" [class.active]="roleChoisi === 'ROLE_USER'" (click)="roleChoisi = 'ROLE_USER'">
              <i class="ti ti-user"></i> Utilisateur
            </button>
            <button type="button" class="role-btn" [class.active]="roleChoisi === 'ROLE_PRO'" (click)="roleChoisi = 'ROLE_PRO'">
              <i class="ti ti-building-store"></i> Professionnel
            </button>
            <button type="button" class="role-btn" [class.active]="roleChoisi === 'ROLE_ADMIN'" (click)="roleChoisi = 'ROLE_ADMIN'">
              <i class="ti ti-shield-check"></i> Administrateur
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="sauvegarder()">
            <div class="row2">
              <div class="field-group">
                <label>Nom</label>
                <input type="text" formControlName="nom" placeholder="Traoré">
              </div>
              <div class="field-group">
                <label>Prénom</label>
                <input type="text" formControlName="prenom" placeholder="Prénom">
              </div>
            </div>

            <div class="field-group">
              <label>Numéro de téléphone (compte)</label>
              <app-phone-input formControlName="telephone"></app-phone-input>
            </div>

            <div class="field-group">
              <label>Mot de passe</label>
              <input type="password" formControlName="motDePasse" placeholder="••••••••">
            </div>

            @if (roleChoisi === 'ROLE_PRO') {
              <div class="section-divider">Établissement</div>

              <div class="field-group">
                <label>Nom de l'établissement</label>
                <input type="text" formControlName="nomEtablissement" placeholder="Garage Kaboré">
              </div>

              <div class="field-group">
                <label>Catégorie</label>
                <select formControlName="categorieId">
                  <option value="">Choisir une catégorie</option>
                  @for (c of categories(); track c.id) {
                    <option [value]="c.id">{{ c.libelle }}</option>
                  }
                </select>
              </div>

              @if (form.get('categorieId')?.value) {
                <div class="field-group">
                  <label>Services</label>
                  <div class="services-grid">
                    @for (s of services(); track s.id) {
                      <label class="service-chip" [class.checked]="isServiceSelected(s.id)">
                        <input type="checkbox" hidden [checked]="isServiceSelected(s.id)" (change)="toggleService(s.id)">
                        {{ s.libelle }}
                      </label>
                    }
                  </div>
                </div>
              }

              <div class="field-group">
                <label>Description</label>
                <textarea formControlName="description" rows="2"></textarea>
              </div>

              <div class="row2">
                <div class="field-group">
                  <label>Téléphone établissement (local)</label>
                  <input type="tel" inputmode="numeric" formControlName="telephonePro" placeholder="70 00 00 00" maxlength="8">
                </div>
                <div class="field-group">
                  <label>WhatsApp</label>
                  <input type="tel" inputmode="numeric" formControlName="whatsapp" placeholder="70 00 00 00" maxlength="8">
                </div>
              </div>

              <div class="row2">
                <div class="field-group">
                  <label>Ville</label>
                  <select formControlName="ville">
                    <option value="">Choisir</option>
                    @for (v of villes; track v) {
                      <option [value]="v">{{ v }}</option>
                    }
                  </select>
                </div>
                <div class="field-group">
                  <label>Horaires</label>
                  <input type="text" formControlName="horaires" placeholder="Lun-Sam 8h-18h">
                </div>
              </div>
            }

            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="fermerFormulaire()">Annuler</button>
              <button type="submit" class="btn-save" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Création...' : 'Créer le compte' }}
              </button>
            </div>
          </form>
        </div>
      }

      @if (error()) {
        <div class="note-box">
          <i class="ti ti-alert-triangle"></i>
          <p>Impossible de charger la liste des utilisateurs pour le moment.</p>
        </div>
      } @else if (loading()) {
        <div class="spinner"></div>
      } @else {
        <table>
          <thead><tr><th>Nom</th><th>Téléphone</th><th>Rôle</th><th>Actions</th></tr></thead>
          <tbody>
            @for (u of usersFiltres(); track u.id) {
              <tr>
                <td class="bold">{{ u.prenom }} {{ u.nom }}</td>
                <td>{{ u.telephone }}</td>
                <td><span class="role-tag" [class]="roleClass(u.role)">{{ roleLabel(u.role) }}</span></td>
                <td>
                  <button class="btn-icon danger" (click)="supprimer(u)"><i class="ti ti-trash"></i></button>
                </td>
              </tr>
            }
            @empty { <tr><td colspan="4" class="empty-row">Aucun utilisateur</td></tr> }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }
    .page { padding: 28px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { font-size: 20px; font-weight: 800; color: var(--fg-text); margin: 0; }

    .header-actions { display: flex; gap: 10px; align-items: center; }

    .search-box { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--fg-border); border-radius: 8px; padding: 8px 14px;
      i { font-size: 15px; color: #aaa; } input { border: none; outline: none; background: transparent; font-family: 'Poppins', sans-serif; font-size: 12.5px; width: 200px; } }

    .btn-add { background: var(--fg-green); color: #fff; border: none; border-radius: 8px; padding: 10px 16px; font-size: 12.5px; font-weight: 700; font-family: 'Poppins', sans-serif; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; }

    .form-card { background: #fff; border: 1px solid var(--fg-border); border-radius: 12px; padding: 22px; margin-bottom: 20px; max-width: 560px;
      h3 { font-size: 14px; font-weight: 700; margin: 0 0 16px; color: var(--fg-text); } }

    .alert-error { background: var(--fg-red-light); color: var(--fg-red); padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 12px; }
    .alert-success { background: var(--fg-green-light); color: var(--fg-green-dark); padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 12px; }

    .role-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 18px; }
    .role-btn {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 14px 8px; border-radius: 10px;
      border: 1.5px solid var(--fg-border); background: #fff;
      font-size: 11.5px; font-weight: 600; color: var(--fg-text-secondary);
      cursor: pointer; font-family: 'Poppins', sans-serif;
      transition: all .15s;

      i { font-size: 20px; }

      &.active { background: var(--fg-green-light); border-color: var(--fg-green); color: var(--fg-green-dark); }
      &:hover:not(.active) { border-color: var(--fg-green); }
    }

    form { display: flex; flex-direction: column; gap: 14px; }
    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .field-group { display: flex; flex-direction: column; gap: 5px; }
    .field-group label { font-size: 11px; font-weight: 600; color: #555; }
    .field-group input, .field-group select, .field-group textarea {
      border: 1.5px solid var(--fg-border); border-radius: 8px; padding: 9px 12px;
      font-family: 'Poppins', sans-serif; font-size: 12.5px; outline: none; resize: none;
      &:focus { border-color: var(--fg-green); }
    }

    .section-divider {
      font-size: 11px; font-weight: 700; color: var(--fg-green);
      text-transform: uppercase; letter-spacing: .5px;
      padding-top: 8px;
      border-top: 1px solid var(--fg-border);
    }

    .services-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .service-chip {
      display: inline-flex; align-items: center;
      padding: 7px 12px; border-radius: 999px;
      border: 1.5px solid var(--fg-border); background: #fff;
      font-size: 11.5px; font-weight: 600; color: #555;
      cursor: pointer; transition: all .15s; user-select: none;
      &:hover { border-color: var(--fg-green); }
      &.checked { background: var(--fg-green); border-color: var(--fg-green); color: #fff; }
    }

    .form-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .btn-cancel { background: var(--fg-bg); border: 1px solid var(--fg-border); border-radius: 8px; padding: 9px 16px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; }
    .btn-save { background: var(--fg-green); color: #fff; border: none; border-radius: 8px; padding: 9px 16px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; &:disabled { opacity: .6; } }

    table { width: 100%; border-collapse: collapse; font-size: 12.5px; background: #fff; border-radius: 10px; overflow: hidden; }
    thead tr { background: var(--fg-bg); }
    th { text-align: left; padding: 12px; font-size: 10px; font-weight: 700; color: #aaa; text-transform: uppercase; }
    td { padding: 12px; border-bottom: 1px solid #f5f5f5; }
    .bold { font-weight: 700; color: var(--fg-text); }

    .role-tag {
      font-size: 10.5px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
      background: var(--fg-green-light); color: var(--fg-green-dark);
      &.pro { background: #e8f0ff; color: #1a3da0; }
      &.admin { background: var(--fg-red-light); color: var(--fg-red); }
    }

    .btn-icon { width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--fg-border); background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
      i { font-size: 14px; } &.danger i { color: var(--fg-red); } &:hover { background: var(--fg-bg); } }

    .empty-row { text-align: center; color: #aaa; padding: 32px; }
    .spinner { width: 30px; height: 30px; border: 3px solid var(--fg-border); border-top-color: var(--fg-green); border-radius: 50%; animation: spin .7s linear infinite; margin: 32px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .note-box { background: var(--fg-yellow-light); border: 1px solid var(--fg-yellow); border-radius: 10px; padding: 14px 16px; display: flex; gap: 10px;
      i { color: #a67f00; font-size: 18px; } p { font-size: 12px; color: #6b5500; margin: 0; line-height: 1.6; } }
  `],
})
export class AdminUtilisateurs implements OnInit {
  private adminService = inject(AdminService);
  private categorieService = inject(CategorieService);
  private serviceService = inject(ServiceService);
  private fb = inject(FormBuilder);

  users = signal<Utilisateur[]>([]);
  loading = signal(true);
  error = signal(false);
  searchTerm = '';

  showForm = signal(false);
  saving = signal(false);
  erreur = '';
  succes = '';
  roleChoisi: 'ROLE_USER' | 'ROLE_PRO' | 'ROLE_ADMIN' = 'ROLE_USER';

  categories = signal<Categorie[]>([]);
  services = signal<Service[]>([]);
  villes = VILLES;

  form: FormGroup = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    telephone: ['', Validators.required],
    motDePasse: ['', [Validators.required, Validators.minLength(6)]],
    nomEtablissement: [''],
    categorieId: [''],
    serviceIds: [[] as number[]],
    description: [''],
    telephonePro: [''],
    whatsapp: [''],
    ville: [''],
    horaires: [''],
  });

  usersFiltres = () => {
    if (!this.searchTerm) return this.users();
    const s = this.searchTerm.toLowerCase();
    return this.users().filter((u) => `${u.prenom} ${u.nom}`.toLowerCase().includes(s) || u.telephone.includes(s));
  };

  ngOnInit(): void {
    this.charger();

    this.categorieService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.categories.set([]),
    });

    this.form.get('categorieId')!.valueChanges.subscribe((categorieId) => {
      this.form.get('serviceIds')!.setValue([]);
      this.services.set([]);
      if (!categorieId) return;

      this.serviceService.getByCategorie(+categorieId).subscribe({
        next: (data) => this.services.set(data),
        error: () => this.services.set([]),
      });
    });
  }

  charger(): void {
    this.loading.set(true);
    this.adminService.getUtilisateurs().subscribe({
      next: (data) => { this.users.set(data); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  ouvrirFormulaire(): void {
    this.form.reset({ serviceIds: [] });
    this.roleChoisi = 'ROLE_USER';
    this.erreur = '';
    this.succes = '';
    this.showForm.set(true);
  }

  fermerFormulaire(): void {
    this.showForm.set(false);
  }

  isServiceSelected(id: number): boolean {
    const current: number[] = this.form.get('serviceIds')?.value || [];
    return current.includes(id);
  }

  toggleService(id: number): void {
    const control = this.form.get('serviceIds')!;
    const current: number[] = control.value || [];
    control.setValue(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }

  sauvegarder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.roleChoisi === 'ROLE_PRO' && !this.form.value.nomEtablissement) {
      this.erreur = "Le nom de l'établissement est obligatoire pour un compte professionnel.";
      return;
    }

    this.saving.set(true);
    this.erreur = '';

    const v = this.form.value;

    this.adminService.createUtilisateur({
      nom: v.nom,
      prenom: v.prenom,
      telephone: v.telephone,
      motDePasse: v.motDePasse,
      role: this.roleChoisi,
      nomEtablissement: this.roleChoisi === 'ROLE_PRO' ? v.nomEtablissement : undefined,
      serviceIds: this.roleChoisi === 'ROLE_PRO' ? v.serviceIds : undefined,
      description: this.roleChoisi === 'ROLE_PRO' ? v.description : undefined,
      telephonePro: this.roleChoisi === 'ROLE_PRO' ? v.telephonePro : undefined,
      whatsapp: this.roleChoisi === 'ROLE_PRO' ? v.whatsapp : undefined,
      ville: this.roleChoisi === 'ROLE_PRO' ? v.ville : undefined,
      horaires: this.roleChoisi === 'ROLE_PRO' ? v.horaires : undefined,
    }).subscribe({
      next: () => {
        this.succes = 'Compte créé avec succès !';
        this.saving.set(false);
        this.showForm.set(false);
        this.charger();
      },
      error: (err) => {
        this.erreur = err.error?.erreur ?? 'Erreur lors de la création.';
        this.saving.set(false);
      },
    });
  }

  supprimer(u: Utilisateur): void {
    if (!confirm(`Supprimer l'utilisateur ${u.prenom} ${u.nom} ?`)) return;
    this.adminService.deleteUtilisateur(u.id).subscribe({
      next: () => this.users.update((list) => list.filter((x) => x.id !== u.id)),
      error: (err: any) => alert('Erreur lors de la suppression.'),
    });
  }

  roleClass(role: string): string {
    if (role === 'ROLE_PRO') return 'pro';
    if (role === 'ROLE_ADMIN') return 'admin';
    return '';
  }

  roleLabel(role: string): string {
    if (role === 'ROLE_PRO') return 'Professionnel';
    if (role === 'ROLE_ADMIN') return 'Administrateur';
    return 'Utilisateur';
  }
}