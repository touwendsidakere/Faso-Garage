import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CategorieService, ServiceService } from '../../../../core/services/api.services';
import { Categorie, Service } from '../../../../core/models';
import { PhoneInput } from '../../../../shared/components/phone-input/phone-input';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const pwd = control.get('motDePasse')?.value;
  const confirm = control.get('confirmer')?.value;
  return pwd && confirm && pwd !== confirm ? { mismatch: true } : null;
}

function requireAtLeastOneService(control: AbstractControl): ValidationErrors | null {
  const value = control.value as number[] | null;
  return value && value.length > 0 ? null : { required: true };
}

const VILLES = [
  'Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora',
  'Ouahigouya', 'Tenkodogo', "Fada N'Gourma", 'Dédougou',
];

@Component({
  selector: 'app-register-pro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PhoneInput],
  template: `
    <div class="page">
      <div class="auth-card">

        <!-- ═══════════════ PANNEAU GAUCHE (vert) ═══════════════ -->
        <div class="side-panel">

          <div class="side-content">
            <h2>Référencez votre établissement</h2>
            <p>Rejoignez le plus grand annuaire de professionnels de l'automobile au Burkina Faso et gagnez en visibilité.</p>

            <ul class="side-benefits">
              <li><i class="ti ti-check"></i> Visible sur la carte et les recherches</li>
              <li><i class="ti ti-check"></i> Recevez des avis clients</li>
              <li><i class="ti ti-check"></i> Gratuit et simple à mettre à jour</li>
            </ul>
          </div>

          <div class="side-footer">
            <p>Vous êtes un particulier ?</p>
            <a routerLink="/inscription" class="btn-ghost-white">Créer un compte utilisateur</a>
          </div>
        </div>

        <!-- ═══════════════ FORMULAIRE ═══════════════ -->
        <div class="form-panel">
          <div class="form-inner">

            <div class="steps-bar">
              <div class="step-item">
                <div class="step-circle" [class.active]="etape === 1" [class.done]="etape > 1">
                  @if (etape > 1) { <i class="ti ti-check"></i> } @else { 1 }
                </div>
                <div class="step-label" [class.active]="etape === 1" [class.done]="etape > 1">Compte</div>
              </div>
              <div class="step-line" [class.done]="etape > 1"></div>
              <div class="step-item">
                <div class="step-circle" [class.active]="etape === 2" [class.todo]="etape < 2">2</div>
                <div class="step-label" [class.active]="etape === 2">Établissement</div>
              </div>
            </div>

            @if (erreur) {
              <div class="alert-error">{{ erreur }}</div>
            }

            <!-- ÉTAPE 1 -->
            @if (etape === 1) {
              <h1>Votre compte</h1>
              <p class="subtitle">Étape 1 sur 2 — Informations personnelles</p>

              <form [formGroup]="step1Form" (ngSubmit)="nextStep()">

                <div class="row2">
                  <div class="field-group">
                    <label>Nom</label>
                    <div class="field-input" [class.focused]="step1Form.get('nom')?.dirty">
                      <i class="ti ti-user"></i>
                      <input type="text" formControlName="nom" placeholder="Kaboré">
                    </div>
                  </div>
                  <div class="field-group">
                    <label>Prénom</label>
                    <div class="field-input" [class.focused]="step1Form.get('prenom')?.dirty">
                      <i class="ti ti-user"></i>
                      <input type="text" formControlName="prenom" placeholder="Prénom">
                    </div>
                  </div>
                </div>

                <div class="field-group">
                  <label>Numéro de téléphone</label>
                  <app-phone-input formControlName="telephone"></app-phone-input>
                </div>

                <div class="row2">
                  <div class="field-group">
                    <label>Mot de passe</label>
                    <div class="field-input" [class.focused]="step1Form.get('motDePasse')?.dirty">
                      <i class="ti ti-lock"></i>
                      <input [type]="showPwd ? 'text' : 'password'" formControlName="motDePasse" placeholder="••••••">
                      <i class="ti eye" [class.ti-eye]="showPwd" [class.ti-eye-off]="!showPwd"
                         (click)="showPwd = !showPwd"></i>
                    </div>
                  </div>
                  <div class="field-group">
                    <label>Confirmer</label>
                    <div class="field-input"
                         [class.focused]="step1Form.get('confirmer')?.dirty"
                         [class.invalid]="step1Form.hasError('mismatch') && step1Form.get('confirmer')?.dirty">
                      <i class="ti ti-lock-check"></i>
                      <input [type]="showPwd ? 'text' : 'password'" formControlName="confirmer" placeholder="••••••">
                    </div>
                  </div>
                </div>

                @if (step1Form.hasError('mismatch') && step1Form.get('confirmer')?.dirty) {
                  <div class="field-error">Les mots de passe ne correspondent pas</div>
                }

                <div class="info-banner">
                  <i class="ti ti-info-circle"></i>
                  <p>Votre compte sera <strong>validé par un administrateur</strong> avant d'apparaître sur la carte.</p>
                </div>

                <button type="submit" class="btn-submit">Suivant : Mon établissement →</button>

              </form>
            }

            <!-- ÉTAPE 2 -->
            @if (etape === 2) {
              <h1>Votre établissement</h1>
              <p class="subtitle">Étape 2 sur 2 — Informations du garage</p>

              <form [formGroup]="step2Form" (ngSubmit)="submit()">

                <div class="field-group">
                  <label>Nom de l'établissement</label>
                  <div class="field-input" [class.focused]="step2Form.get('nomEtablissement')?.dirty">
                    <i class="ti ti-building-store"></i>
                    <input type="text" formControlName="nomEtablissement" placeholder="Garage Kaboré">
                  </div>
                </div>

                <div class="field-group">
                  <label>Catégorie</label>
                  <div class="field-input" [class.focused]="step2Form.get('categorieId')?.dirty">
                    <i class="ti ti-category"></i>
                    <select formControlName="categorieId">
                      <option value="">Choisir une catégorie</option>
                      @for (c of categories(); track c.id) {
                        <option [value]="c.id">{{ c.libelle }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="field-group">
                  <label>Services proposés</label>
                  @if (!step2Form.get('categorieId')?.value) {
                    <div class="services-hint">Choisissez d'abord une catégorie</div>
                  } @else if (servicesLoading()) {
                    <div class="services-hint">Chargement des services...</div>
                  } @else if (services().length === 0) {
                    <div class="services-hint">Aucun service disponible pour cette catégorie</div>
                  } @else {
                    <div class="services-grid">
                      @for (s of services(); track s.id) {
                        <label class="service-chip" [class.checked]="isServiceSelected(s.id)">
                          <input type="checkbox" hidden [checked]="isServiceSelected(s.id)" (change)="toggleService(s.id)">
                          {{ s.libelle }}
                        </label>
                      }
                    </div>
                  }
                  @if (step2Form.get('serviceIds')?.hasError('required') && step2Form.get('serviceIds')?.touched) {
                    <div class="field-error">Sélectionnez au moins un service</div>
                  }
                </div>

                <div class="field-group">
                  <label>Description</label>
                  <div class="field-input textarea-input">
                    <i class="ti ti-file-text"></i>
                    <textarea formControlName="description" placeholder="Décrivez votre activité, vos spécialités..." rows="3"></textarea>
                  </div>
                </div>

                <div class="field-group">
                  <label>WhatsApp</label>
                  <div class="field-input" [class.focused]="step2Form.get('whatsapp')?.dirty">
                    <i class="ti ti-brand-whatsapp"></i>
                    <input type="tel" inputmode="numeric" formControlName="whatsapp" placeholder="70 00 00 00" maxlength="8">
                  </div>
                </div>

                <div class="row2">
                  <div class="field-group">
                    <label>Ville</label>
                    <div class="field-input" [class.focused]="step2Form.get('ville')?.dirty">
                      <i class="ti ti-map-pin"></i>
                      <select formControlName="ville">
                        <option value="">Choisir</option>
                        @for (v of villes; track v) {
                          <option [value]="v">{{ v }}</option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="field-group">
                    <label>Horaires</label>
                    <div class="field-input" [class.focused]="step2Form.get('horaires')?.dirty">
                      <i class="ti ti-clock"></i>
                      <input type="text" formControlName="horaires" placeholder="Lun-Sam 8h-18h">
                    </div>
                  </div>
                </div>

                <div class="geo-box">
                  <div class="geo-icon"><i class="ti ti-current-location"></i></div>
                  <div class="geo-text">
                    <p>{{ geoLabel }}</p>
                    <small>{{ geoSub }}</small>
                  </div>
                  <button type="button" class="geo-btn" (click)="localiser()" [disabled]="geoLoading">
                    {{ geoLoading ? '...' : 'Localiser' }}
                  </button>
                </div>

                <div class="btn-row">
                  <button type="button" class="btn-back" (click)="etape = 1">← Retour</button>
                  <button type="submit" class="btn-submit" [disabled]="loading">
                    {{ loading ? 'Envoi...' : 'Soumettre ma demande' }}
                  </button>
                </div>

              </form>
            }

          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }

    .page {
      min-height: 100vh;
      background: var(--fg-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
    }

    .auth-card {
      display: flex;
      max-width: 1040px;
      width: 100%;
      min-height: 680px;
      background: #fff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: var(--fg-shadow-md);
    }

    // ─── PANNEAU GAUCHE ─────────────────────────
    .side-panel {
      flex: 0 0 40%;
      background: linear-gradient(160deg, var(--fg-green) 0%, var(--fg-green-dark) 100%);
      padding: 44px 40px;
      display: flex;
      flex-direction: column;
      color: #fff;
    }

    .side-content {
      flex: 1;

      h2 { font-size: 24px; font-weight: 800; margin: 0 0 14px; line-height: 1.3; }
      p { font-size: 13.5px; color: rgba(255,255,255,.85); line-height: 1.7; margin: 0 0 24px; }
    }

    .side-benefits {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: rgba(255,255,255,.9);
      }

      i { color: var(--fg-yellow); font-size: 16px; flex-shrink: 0; }
    }

    .side-footer {
      p { font-size: 12.5px; color: rgba(255,255,255,.7); margin: 0 0 10px; }
    }

    .btn-ghost-white {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid rgba(255,255,255,.5);
      color: #fff;
      text-decoration: none;
      padding: 11px 20px;
      border-radius: 10px;
      font-size: 12.5px;
      font-weight: 600;
      transition: all .2s;

      &:hover { background: rgba(255,255,255,.12); border-color: #fff; }
    }

    // ─── FORMULAIRE ─────────────────────────────
    .form-panel {
      flex: 1;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 44px 40px;
      overflow-y: auto;
      max-height: 90vh;
    }

    .form-inner {
      width: 100%;
      max-width: 440px;
    }

    // ─── STEPPER ────────────────────────────────
    .steps-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 28px;
    }

    .step-item { display: flex; align-items: center; gap: 8px; }

    .step-circle {
      width: 30px; height: 30px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12.5px; font-weight: 700; flex-shrink: 0;
      background: var(--fg-border); color: #aaa;

      &.done { background: var(--fg-green); color: #fff; }
      &.active { background: var(--fg-red); color: #fff; }
    }

    .step-label {
      font-size: 12px; font-weight: 600; color: #aaa;
      &.active { color: var(--fg-red); }
      &.done { color: var(--fg-green); }
    }

    .step-line {
      flex: 1; height: 2px; background: var(--fg-border); border-radius: 1px;
      &.done { background: var(--fg-green); }
    }

    // ─── TITRES ─────────────────────────────────
    .form-inner h1 {
      font-size: 24px;
      font-weight: 800;
      color: var(--fg-text);
      margin: 0 0 6px;
    }

    .subtitle {
      font-size: 13px;
      color: var(--fg-text-secondary);
      margin: 0 0 24px;
    }

    // ─── FORM ───────────────────────────────────
    form { display: flex; flex-direction: column; gap: 16px; }

    .alert-error {
      background: var(--fg-red-light);
      color: var(--fg-red);
      padding: 11px 15px;
      border-radius: 10px;
      font-size: 12.5px;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .field-group { display: flex; flex-direction: column; gap: 7px; }
    .field-group label { font-size: 12.5px; font-weight: 600; color: var(--fg-text); }

    .field-input {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--fg-bg);
      border: 1.5px solid var(--fg-border);
      border-radius: 10px;
      padding: 12px 14px;
      transition: border-color .2s;

      i { font-size: 16px; color: #999; transition: color .2s; }

      input, select, textarea {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-family: 'Poppins', sans-serif;
        font-size: 13px;
        color: var(--fg-text);
        min-width: 0;

        &::placeholder { color: #bbb; }
      }

      .eye { cursor: pointer; }

      &.focused { border-color: var(--fg-green); i { color: var(--fg-green); } }
      &.invalid { border-color: var(--fg-red); }
    }

    .textarea-input { align-items: flex-start; padding-top: 12px; i { margin-top: 2px; } textarea { resize: none; } }

    .field-error { font-size: 11.5px; color: var(--fg-red); font-weight: 500; }

    .services-hint { font-size: 12px; color: #999; font-style: italic; padding: 6px 0; }
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

    .info-banner {
      background: var(--fg-yellow-light);
      border: 1.5px solid var(--fg-yellow);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      align-items: flex-start;
      gap: 8px;

      i { font-size: 16px; color: var(--fg-red); margin-top: 1px; }
      p { font-size: 11.5px; color: #6b5500; line-height: 1.5; margin: 0; }
    }

    .geo-box {
      background: var(--fg-green-light);
      border: 1.5px solid #c3e6d0;
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .geo-icon {
      width: 36px; height: 36px; background: var(--fg-green);
      border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      i { font-size: 18px; color: #fff; }
    }

    .geo-text { flex: 1; }
    .geo-text p { font-size: 12px; font-weight: 600; color: var(--fg-green-dark); margin: 0; }
    .geo-text small { font-size: 10.5px; color: #6b8f7a; }

    .geo-btn {
      background: var(--fg-green); color: #fff; border: none; border-radius: 8px;
      padding: 8px 14px; font-size: 11px; font-weight: 600;
      font-family: 'Poppins', sans-serif; cursor: pointer; white-space: nowrap;
      &:disabled { opacity: .6; cursor: not-allowed; }
    }

    .btn-submit {
      background: var(--fg-green);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 15px;
      font-size: 14px;
      font-weight: 700;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      transition: background .2s;
      width: 100%;

      &:hover:not(:disabled) { background: var(--fg-green-dark); }
      &:disabled { opacity: .6; cursor: not-allowed; }
    }

    .btn-back {
      background: #fff;
      color: var(--fg-text-secondary);
      border: 1.5px solid var(--fg-border);
      border-radius: 10px;
      padding: 15px;
      font-size: 13px;
      font-weight: 600;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      width: 100%;
    }

    .btn-row { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; }

    // ─── RESPONSIVE ─────────────────────────────
    @media (max-width: 860px) {
      .page { padding: 0; }

      .auth-card {
        flex-direction: column;
        border-radius: 0;
        min-height: 100vh;
        max-width: 100%;
      }

      .side-panel { flex: 0 0 auto; padding: 32px 24px; }
      .side-content h2 { font-size: 19px; }
      .side-content p { font-size: 12.5px; margin-bottom: 16px; }
      .side-benefits { display: none; }
      .side-footer { display: none; }

      .form-panel { padding: 28px 20px 48px; max-height: none; }
    }
  `],
})
export class RegisterPro implements OnInit {
  private categorieService = inject(CategorieService);
  private serviceService = inject(ServiceService);

  etape = 1;
  loading = false;
  erreur = '';
  showPwd = false;
  geoLoading = false;
  geoLabel = 'Localisation GPS';
  geoSub = 'Cliquez pour utiliser votre position actuelle';
  villes = VILLES;

  categories = signal<Categorie[]>([]);
  services = signal<Service[]>([]);
  servicesLoading = signal(false);

  step1Form: FormGroup;
  step2Form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.step1Form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', Validators.required],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmer: ['', Validators.required],
    }, { validators: passwordMatch });

    this.step2Form = this.fb.group({
      nomEtablissement: ['', Validators.required],
      categorieId: ['', Validators.required],
      serviceIds: [[] as number[], requireAtLeastOneService],
      description: ['', Validators.required],
      whatsapp: [''],
      ville: ['', Validators.required],
      horaires: ['', Validators.required],
      latitude: [0],
      longitude: [0],
    });
  }

  ngOnInit(): void {
    this.categorieService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.categories.set([]),
    });

    this.step2Form.get('categorieId')!.valueChanges.subscribe((categorieId) => {
      this.step2Form.get('serviceIds')!.setValue([]);
      this.services.set([]);

      if (!categorieId) return;

      this.servicesLoading.set(true);
      this.serviceService.getByCategorie(+categorieId).subscribe({
        next: (data) => {
          this.services.set(data);
          this.servicesLoading.set(false);
        },
        error: () => {
          this.services.set([]);
          this.servicesLoading.set(false);
        },
      });
    });
  }

  isServiceSelected(id: number): boolean {
    const current: number[] = this.step2Form.get('serviceIds')?.value || [];
    return current.includes(id);
  }

  toggleService(id: number): void {
    const control = this.step2Form.get('serviceIds')!;
    const current: number[] = control.value || [];
    control.setValue(
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
    control.markAsTouched();
  }

  nextStep() {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }
    this.etape = 2;
  }

  localiser() {
    if (!navigator.geolocation) return;
    this.geoLoading = true;
    this.geoSub = 'Recherche en cours...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.step2Form.patchValue({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        this.geoLabel = 'Position détectée ✓';
        this.geoSub = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        this.geoLoading = false;
      },
      () => {
        this.geoSub = 'Impossible de détecter la position';
        this.geoLoading = false;
      }
    );
  }

  submit() {
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.erreur = '';

    const s1 = this.step1Form.value;
    const s2 = this.step2Form.value;

    this.auth.registerPro({
      nom: s1.nom,
      prenom: s1.prenom,
      telephone: s1.telephone,
      motDePasse: s1.motDePasse,
      role: 'ROLE_PRO',
      nomEtablissement: s2.nomEtablissement,
      categorieId: +s2.categorieId,
      serviceIds: s2.serviceIds,
      description: s2.description,
      whatsapp: s2.whatsapp,
      ville: s2.ville,
      horaires: s2.horaires,
      latitude: s2.latitude,
      longitude: s2.longitude,
    }).subscribe({
      next: () => this.router.navigate(['/en-attente']),
      error: (err) => {
        this.erreur = err.error?.erreur ?? 'Une erreur est survenue. Réessayez.';
        this.loading = false;
      },
    });
  }
}