import { Component, HostListener, forwardRef, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Indicatif } from '../../../core/models';

const PAYS: Indicatif[] = [
  { pays: 'Burkina Faso', code: '+226', drapeau: '🇧🇫', isoCode: 'BF', longueurNumero: 8 },
  { pays: "Côte d'Ivoire", code: '+225', drapeau: '🇨🇮', isoCode: 'CI', longueurNumero: 10 },
  { pays: 'Mali', code: '+223', drapeau: '🇲🇱', isoCode: 'ML', longueurNumero: 8 },
  { pays: 'Niger', code: '+227', drapeau: '🇳🇪', isoCode: 'NE', longueurNumero: 8 },
  { pays: 'Togo', code: '+228', drapeau: '🇹🇬', isoCode: 'TG', longueurNumero: 8 },
  { pays: 'Bénin', code: '+229', drapeau: '🇧🇯', isoCode: 'BJ', longueurNumero: 8 },
  { pays: 'Sénégal', code: '+221', drapeau: '🇸🇳', isoCode: 'SN', longueurNumero: 9 },
  { pays: 'Ghana', code: '+233', drapeau: '🇬🇭', isoCode: 'GH', longueurNumero: 9 },
  { pays: 'France', code: '+33', drapeau: '🇫🇷', isoCode: 'FR', longueurNumero: 9 },
];

@Component({
  selector: 'app-phone-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInput),
      multi: true,
    },
  ],
  template: `
    <div class="phone-input" [class.focused]="focused()">
      <button type="button" class="country-select" (click)="toggleDropdown($event)">
        <span class="flag">{{ selected().drapeau }}</span>
        <span class="code">{{ selected().code }}</span>
        <i class="ti ti-chevron-down" [class.rotated]="dropdownOpen()"></i>
      </button>

      <span class="separator"></span>

      <input
        type="tel"
        inputmode="numeric"
        [placeholder]="placeholder"
        [value]="numero()"
        [attr.maxlength]="selected().longueurNumero || 12"
        (input)="onNumeroInput($event)"
        (focus)="focused.set(true)"
        (blur)="onBlur()"
      />

      @if (dropdownOpen()) {
        <div class="country-dropdown" (click)="$event.stopPropagation()">
          @for (p of pays; track p.isoCode) {
            <button type="button" class="country-option" (click)="selectPays(p)">
              <span class="flag">{{ p.drapeau }}</span>
              <span class="nom">{{ p.pays }}</span>
              <span class="code">{{ p.code }}</span>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }

    .phone-input {
      display: flex;
      align-items: center;
      background: #fff;
      border: 1.5px solid var(--fg-border);
      border-radius: var(--fg-btn-radius, 12px);
      padding: 4px 14px 4px 6px;
      transition: border-color .2s;
      position: relative;

      &.focused {
        border-color: var(--fg-green);
      }
    }

    .country-select {
      display: flex;
      align-items: center;
      gap: 5px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px 6px;
      font-family: 'Poppins', sans-serif;

      .flag { font-size: 17px; line-height: 1; }
      .code { font-size: 13px; font-weight: 600; color: var(--fg-text); }

      i.ti-chevron-down {
        font-size: 13px;
        color: #aaa;
        transition: transform .2s;
        &.rotated { transform: rotate(180deg); }
      }
    }

    .separator {
      width: 1px;
      height: 22px;
      background: var(--fg-border);
      margin: 0 8px;
    }

    input {
      flex: 1;
      border: none;
      outline: none;
      font-family: 'Poppins', sans-serif;
      font-size: 13px;
      color: var(--fg-text);
      background: transparent;
      padding: 8px 0;
      min-width: 0;
    }

    input::placeholder { color: #bbb; }

    .country-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      width: 260px;
      max-height: 260px;
      overflow-y: auto;
      background: #fff;
      border: 1px solid var(--fg-border);
      border-radius: 12px;
      box-shadow: var(--fg-shadow-md, 0 4px 20px rgba(0,0,0,.1));
      z-index: 50;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .country-option {
      display: flex;
      align-items: center;
      gap: 10px;
      background: transparent;
      border: none;
      padding: 9px 10px;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      font-family: 'Poppins', sans-serif;

      &:hover { background: var(--fg-bg); }

      .flag { font-size: 16px; }
      .nom { flex: 1; font-size: 13px; color: var(--fg-text); }
      .code { font-size: 12.5px; color: var(--fg-text-secondary); font-weight: 500; }
    }
  `],
})
export class PhoneInput implements ControlValueAccessor {
  pays = PAYS;

  selected = signal<Indicatif>(PAYS[0]);
  numero = signal('');
  dropdownOpen = signal(false);
  focused = signal(false);
  placeholder = '70 00 11 11';

  private onChange: (value: string) => void = () => {};
  private onTouchedFn: () => void = () => {};

  writeValue(value: string | null): void {
    if (!value) {
      this.selected.set(PAYS[0]);
      this.numero.set('');
      return;
    }
    const match = this.pays
      .slice()
      .sort((a, b) => b.code.length - a.code.length)
      .find((p) => value.startsWith(p.code));

    if (match) {
      this.selected.set(match);
      this.numero.set(value.slice(match.code.length));
    } else {
      this.numero.set(value.replace(/^\+/, ''));
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen.update((v) => !v);
  }

  selectPays(p: Indicatif): void {
    this.selected.set(p);
    this.dropdownOpen.set(false);
    this.emitValue();
  }

  onNumeroInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const digitsOnly = raw.replace(/\D/g, '');
    this.numero.set(digitsOnly);
    this.emitValue();
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouchedFn();
  }

  private emitValue(): void {
    const full = this.numero() ? `${this.selected().code}${this.numero()}` : '';
    this.onChange(full);
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }
}