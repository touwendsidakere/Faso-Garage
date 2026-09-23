import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { PhoneInput } from '../../../../shared/components/phone-input/phone-input';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PhoneInput],
  template: `
    <div class="page">
      <div class="auth-card">

        <!-- ═══════════════ PANNEAU GAUCHE (vert) ═══════════════ -->
        <div class="side-panel">

          <div class="side-content">
            <h2>Bon retour parmi nous !</h2>
            <p>Connectez-vous pour retrouver les garages, dépanneurs et professionnels de l'automobile près de vous.</p>
          </div>

          <div class="side-footer">
            <p>Pas encore de compte ?</p>
            <a routerLink="/inscription" class="btn-ghost-white">Créer un compte</a>
          </div>
        </div>

        <!-- ═══════════════ FORMULAIRE ═══════════════ -->
        <div class="form-panel">
          <div class="form-inner">
            <h1>Connexion</h1>
            <p class="subtitle">Entrez vos identifiants pour continuer</p>

            <form [formGroup]="form" (ngSubmit)="submit()">

              @if (erreur) {
                <div class="alert-error">{{ erreur }}</div>
              }

              <div class="field-group">
                <label>Numéro de téléphone</label>
                <app-phone-input formControlName="telephone"></app-phone-input>
              </div>

              <div class="field-group">
                <label>Mot de passe</label>
                <div class="field-input" [class.focused]="form.get('motDePasse')?.dirty">
                  <i class="ti ti-lock"></i>
                  <input [type]="showPassword ? 'text' : 'password'" formControlName="motDePasse" placeholder="••••••••">
                  <i class="ti eye" [class.ti-eye]="showPassword" [class.ti-eye-off]="!showPassword"
                     (click)="showPassword = !showPassword"></i>
                </div>
              </div>

              <div class="forgot-row">
                <span class="forgot-link">Mot de passe oublié ?</span>
              </div>

              <button type="submit" class="btn-submit" [disabled]="loading || form.invalid">
                {{ loading ? 'Connexion...' : 'Se connecter' }}
              </button>

              <div class="pro-banner" routerLink="/inscription-pro">
                <i class="ti ti-tool"></i>
                <div class="pro-banner-text">
                  Vous êtes un <strong>professionnel ?</strong>
                  Inscrivez votre garage et soyez visible partout au Burkina.
                </div>
                <i class="ti ti-arrow-right"></i>
              </div>

              <div class="mobile-signup-row">
                Pas encore de compte ? <a routerLink="/inscription">S'inscrire</a>
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
      padding: 44px 40px;
    }

    .form-inner {
      width: 100%;
      max-width: 380px;
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
      margin: 0 0 32px;
    }

    form { display: flex; flex-direction: column; gap: 18px; }

    .alert-error {
      background: var(--fg-red-light);
      color: var(--fg-red);
      padding: 11px 15px;
      border-radius: 10px;
      font-size: 12.5px;
      font-weight: 500;
    }

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
    }

    .forgot-row { text-align: right; margin-top: -6px; }
    .forgot-link { font-size: 12.5px; color: var(--fg-text-secondary); cursor: pointer; }

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

    .mobile-signup-row {
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

      .side-logo { height: 36px; margin-bottom: 24px; }
      .side-content h2 { font-size: 20px; }
      .side-content p { font-size: 13px; }
      .side-footer { display: none; }

      .form-panel { padding: 32px 24px 48px; }
      .mobile-signup-row { display: block; }
    }
  `],
})
export class Login {
  form: FormGroup;
  loading = false;
  erreur = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      telephone: ['', Validators.required],
      motDePasse: ['', Validators.required],
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.erreur = '';

    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        if (res.role === 'ROLE_ADMIN') this.router.navigate(['/admin']);
        else if (res.role === 'ROLE_PRO') this.router.navigate(['/profil-pro']);
        else this.router.navigate(['/']);
      },
      error: (err) => {
        this.erreur = err.error?.erreur ?? 'Numéro ou mot de passe incorrect.';
        this.loading = false;
      },
    });
  }
}