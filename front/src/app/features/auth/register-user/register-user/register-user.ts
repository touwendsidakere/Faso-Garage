import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { PhoneInput } from '../../../../shared/components/phone-input/phone-input';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const pwd = control.get('motDePasse')?.value;
  const confirm = control.get('confirmer')?.value;
  return pwd && confirm && pwd !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PhoneInput],
  template: `
    <div class="page">
      <div class="auth-card">

        <!-- ═══════════════ PANNEAU GAUCHE (vert) ═══════════════ -->
        <div class="side-panel">

          <div class="side-content">
            <h2>Rejoignez la communauté</h2>
            <p>Créez votre compte pour laisser des avis, sauvegarder vos garages préférés et bien plus.</p>
          </div>

          <div class="side-footer">
            <p>Déjà un compte ?</p>
            <a routerLink="/connexion" class="btn-ghost-white">Se connecter</a>
          </div>
        </div>

        <!-- ═══════════════ FORMULAIRE ═══════════════ -->
        <div class="form-panel">
          <div class="form-inner">
            <h1>Créer un compte</h1>
            <p class="subtitle">Rejoignez Faso Garages en quelques instants</p>

            <form [formGroup]="form" (ngSubmit)="submit()">

              @if (erreur) {
                <div class="alert-error">{{ erreur }}</div>
              }
              @if (succes) {
                <div class="alert-success">{{ succes }}</div>
              }

              <div class="row2">
                <div class="field-group">
                  <label>Nom</label>
                  <div class="field-input" [class.focused]="form.get('nom')?.dirty">
                    <i class="ti ti-user"></i>
                    <input type="text" formControlName="nom" placeholder="Traoré">
                  </div>
                </div>
                <div class="field-group">
                  <label>Prénom</label>
                  <div class="field-input" [class.focused]="form.get('prenom')?.dirty">
                    <i class="ti ti-user"></i>
                    <input type="text" formControlName="prenom" placeholder="Prénom">
                  </div>
                </div>
              </div>

              <div class="field-group">
                <label>Numéro de téléphone</label>
                <app-phone-input formControlName="telephone"></app-phone-input>
              </div>

              <div class="field-group">
                <label>Mot de passe</label>
                <div class="field-input" [class.focused]="form.get('motDePasse')?.dirty">
                  <i class="ti ti-lock"></i>
                  <input [type]="showPwd ? 'text' : 'password'" formControlName="motDePasse" placeholder="••••••••">
                  <i class="ti eye" [class.ti-eye]="showPwd" [class.ti-eye-off]="!showPwd"
                     (click)="showPwd = !showPwd"></i>
                </div>
              </div>

              <div class="field-group">
                <label>Confirmer le mot de passe</label>
                <div class="field-input" [class.focused]="form.get('confirmer')?.dirty"
                     [class.invalid]="form.hasError('mismatch') && form.get('confirmer')?.dirty">
                  <i class="ti ti-lock-check"></i>
                  <input [type]="showPwd2 ? 'text' : 'password'" formControlName="confirmer" placeholder="••••••••">
                  <i class="ti eye" [class.ti-eye]="showPwd2" [class.ti-eye-off]="!showPwd2"
                     (click)="showPwd2 = !showPwd2"></i>
                </div>
                @if (form.hasError('mismatch') && form.get('confirmer')?.dirty) {
                  <div class="field-error">Les mots de passe ne correspondent pas</div>
                }
              </div>

              <button type="submit" class="btn-submit" [disabled]="loading || form.invalid">
                {{ loading ? 'Création...' : 'Créer mon compte' }}
              </button>

              <div class="pro-banner" routerLink="/inscription-pro">
                <i class="ti ti-tool"></i>
                <div class="pro-banner-text">
                  Vous êtes un <strong>professionnel ?</strong>
                  Inscrivez votre garage et soyez visible partout au Burkina.
                </div>
                <i class="ti ti-arrow-right"></i>
              </div>

              <div class="mobile-login-row">
                Déjà un compte ? <a routerLink="/connexion">Se connecter</a>
              </div>

            </form>
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
      max-width: 980px;
      width: 100%;
      min-height: 600px;
      background: #fff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: var(--fg-shadow-md);
    }

    // ─── PANNEAU GAUCHE ─────────────────────────
    .side-panel {
      flex: 0 0 42%;
      background: linear-gradient(160deg, var(--fg-green) 0%, var(--fg-green-dark) 100%);
      padding: 44px 40px;
      display: flex;
      flex-direction: column;
      color: #fff;
    }

    .side-content {
      flex: 1;

      h2 { font-size: 26px; font-weight: 800; margin: 0 0 14px; line-height: 1.3; }
      p { font-size: 14px; color: rgba(255,255,255,.85); line-height: 1.7; margin: 0; }
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
      padding: 11px 22px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      transition: all .2s;

      &:hover { background: rgba(255,255,255,.12); border-color: #fff; }
    }

    // ─── FORMULAIRE ─────────────────────────────
    .form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      overflow-y: auto;
    }

    .form-inner {
      width: 100%;
      max-width: 400px;
    }

    .form-inner h1 {
      font-size: 26px;
      font-weight: 800;
      color: var(--fg-text);
      margin: 0 0 6px;
    }

    .subtitle {
      font-size: 13.5px;
      color: var(--fg-text-secondary);
      margin: 0 0 28px;
    }

    form { display: flex; flex-direction: column; gap: 16px; }

    .alert-error {
      background: var(--fg-red-light);
      color: var(--fg-red);
      padding: 11px 15px;
      border-radius: 10px;
      font-size: 12.5px;
      font-weight: 500;
    }

    .alert-success {
      background: var(--fg-green-light);
      color: var(--fg-green-dark);
      padding: 11px 15px;
      border-radius: 10px;
      font-size: 12.5px;
      font-weight: 500;
    }

    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .field-group { display: flex; flex-direction: column; gap: 7px; }

    .field-group label {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--fg-text);
    }

    .field-input {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--fg-bg);
      border: 1.5px solid var(--fg-border);
      border-radius: 10px;
      padding: 13px 14px;
      transition: border-color .2s;

      i { font-size: 17px; color: #999; transition: color .2s; }

      input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-family: 'Poppins', sans-serif;
        font-size: 13.5px;
        color: var(--fg-text);

        &::placeholder { color: #bbb; }
      }

      .eye { cursor: pointer; }

      &.focused { border-color: var(--fg-green); i { color: var(--fg-green); } }
      &.invalid { border-color: var(--fg-red); }
    }

    .field-error { font-size: 11.5px; color: var(--fg-red); font-weight: 500; }

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

      &:hover:not(:disabled) { background: var(--fg-green-dark); }
      &:disabled { opacity: .6; cursor: not-allowed; }
    }

    .pro-banner {
      background: var(--fg-yellow-light);
      border: 1.5px solid var(--fg-yellow);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: transform .15s;

      &:hover { transform: translateY(-1px); }

      i:first-child { font-size: 22px; color: var(--fg-red); flex-shrink: 0; }
      i:last-child { font-size: 16px; color: #999; flex-shrink: 0; }
    }

    .pro-banner-text {
      font-size: 12px;
      color: #6b5500;
      line-height: 1.5;
      flex: 1;

      strong { color: var(--fg-red); font-weight: 700; }
    }

    .mobile-login-row {
      display: none;
      text-align: center;
      font-size: 13px;
      color: var(--fg-text-secondary);

      a { color: var(--fg-green); font-weight: 600; text-decoration: none; }
    }

    // ─── RESPONSIVE ─────────────────────────────
    @media (max-width: 860px) {
      .page { padding: 0; }

      .auth-card {
        flex-direction: column;
        border-radius: 0;
        min-height: 100vh;
        max-width: 100%;
      }

      .side-panel {
        flex: 0 0 auto;
        padding: 32px 24px;
      }

      .side-content h2 { font-size: 20px; }
      .side-content p { font-size: 13px; }
      .side-footer { display: none; }

      .form-panel { padding: 32px 24px 48px; }
      .mobile-login-row { display: block; }
    }
  `],
})
export class RegisterUser {
  form: FormGroup;
  loading = false;
  erreur = '';
  succes = '';
  showPwd = false;
  showPwd2 = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', Validators.required],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmer: ['', Validators.required],
    }, { validators: passwordMatch });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.erreur = '';

    const { confirmer, ...data } = this.form.value;

    this.auth.registerUser({ ...data, role: 'ROLE_USER' }).subscribe({
      next: () => {
        this.succes = 'Compte créé avec succès !';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/']), 1200);
      },
      error: (err) => {
        this.erreur = err.error?.erreur ?? 'Une erreur est survenue. Réessayez.';
        this.loading = false;
      },
    });
  }
}