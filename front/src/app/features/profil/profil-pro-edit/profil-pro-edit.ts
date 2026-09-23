import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import * as L from 'leaflet';
import { ProfessionnelService } from '../../../core/services/professionnel.service';
import { FichierService, CategorieService, ServiceService } from '../../../core/services/api.services';
import { Professionnel, Categorie, Service } from '../../../core/models';
import { MediaUrlPipe } from '../../../shared/pipes/media-url.pipe';

const VILLES = [
  'Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora',
  'Ouahigouya', 'Tenkodogo', "Fada N'Gourma", 'Dédougou',
];

function requireAtLeastOneService(control: AbstractControl): ValidationErrors | null {
  const value = control.value as number[] | null;
  return value && value.length > 0 ? null : { required: true };
}

@Component({
  selector: 'app-profil-pro-edit',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, MediaUrlPipe],
  template: `
    <div class="page">

      <!-- COVER -->
      <div class="cover">
        @if (pro()?.photoCouverture) {
          <img [src]="pro()!.photoCouverture | mediaUrl" alt="Couverture" class="cover-img">
        }
        <div class="cover-overlay"></div>
        <div class="page-title">Mon établissement</div>
        <div class="page-sub">Modifiez les informations de votre garage</div>

        <button type="button" class="cover-edit-btn" (click)="coverInput.click()">
          <i class="ti ti-photo"></i> Changer la couverture
        </button>
        <input #coverInput type="file" accept="image/*" hidden (change)="onCoverSelected($event)">

        <div class="logo-wrap">
          <div class="logo-box" (click)="logoInput.click()">
            @if (pro()?.logoUrl) {
              <img [src]="pro()!.logoUrl | mediaUrl" alt="Logo" class="logo-img">
            } @else {
              {{ initiales() }}
            }
            <div class="logo-edit"><i class="ti ti-pencil"></i></div>
          </div>
          <input #logoInput type="file" accept="image/*" hidden (change)="onLogoSelected($event)">
        </div>

        <div class="statut-wrap">
          <span class="statut-badge" [class.valide]="pro()?.statut === 'VALIDE'"
                [class.pending]="pro()?.statut === 'PENDING'"
                [class.rejected]="pro()?.statut === 'REJECTED'">
            @switch (pro()?.statut) {
              @case ('VALIDE') { ✓ Compte validé }
              @case ('PENDING') { ⏳ En attente de validation }
              @case ('REJECTED') { ✕ Compte rejeté }
            }
          </span>
        </div>
      </div>

      <div class="body">

        @if (loading) {
          <div class="spinner"></div>
        } @else if (form) {

          <!-- STATS -->
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-num">{{ pro()?.moyenneNotes | number:'1.1-1' }}</div>
              <div class="stat-label">Note moyenne</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">{{ pro()?.nombreAvis }}</div>
              <div class="stat-label">Avis reçus</div>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="sauvegarder()">

            @if (erreur) {
              <div class="alert-error">{{ erreur }}</div>
            }
            @if (succes) {
              <div class="alert-success">{{ succes }}</div>
            }

            <div class="section-title">Informations générales</div>

            <div class="field-group">
              <div class="field-label">NOM DE L'ÉTABLISSEMENT</div>
              <div class="field-input" [class.focused]="form.get('nomEtablissement')?.dirty">
                <i class="ti ti-building-store"></i>
                <input type="text" formControlName="nomEtablissement" placeholder="Nom de votre garage">
              </div>
            </div>

            <div class="field-group">
              <div class="field-label">CATÉGORIE</div>
              <div class="field-input" [class.focused]="form.get('categorieId')?.dirty">
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
              <div class="field-label">SERVICES PROPOSÉS</div>
              @if (!form.get('categorieId')?.value) {
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
              @if (form.get('serviceIds')?.hasError('required') && form.get('serviceIds')?.touched) {
                <div class="field-error">Sélectionnez au moins un service</div>
              }
            </div>

            <div class="field-group">
              <div class="field-label">DESCRIPTION</div>
              <div class="field-input" style="align-items:flex-start;padding-top:10px">
                <i class="ti ti-file-text" style="margin-top:2px"></i>
                <textarea formControlName="description" placeholder="Décrivez votre activité..." rows="3"></textarea>
              </div>
            </div>

            <div class="section-title">Contact</div>

            <div class="row2">
              <div class="field-group">
                <div class="field-label">TÉLÉPHONE ÉTABLISSEMENT</div>
                <div class="field-input" [class.focused]="form.get('telephone')?.dirty">
                  <i class="ti ti-phone"></i>
                  <input type="tel" inputmode="numeric" formControlName="telephone" placeholder="70 00 00 00" maxlength="8">
                </div>
              </div>
              <div class="field-group">
                <div class="field-label">WHATSAPP</div>
                <div class="field-input" [class.focused]="form.get('whatsapp')?.dirty">
                  <i class="ti ti-brand-whatsapp"></i>
                  <input type="tel" inputmode="numeric" formControlName="whatsapp" placeholder="70 00 00 00" maxlength="8">
                </div>
              </div>
            </div>

            <div class="row2">
              <div class="field-group">
                <div class="field-label">VILLE</div>
                <div class="field-input" [class.focused]="form.get('ville')?.dirty">
                  <i class="ti ti-map-pin"></i>
                  <select formControlName="ville">
                    @for (v of villes; track v) {
                      <option [value]="v">{{ v }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="field-group">
                <div class="field-label">HORAIRES</div>
                <div class="field-input" [class.focused]="form.get('horaires')?.dirty">
                  <i class="ti ti-clock"></i>
                  <input type="text" formControlName="horaires" placeholder="Lun-Sam 8h-18h">
                </div>
              </div>
            </div>

            <div class="section-title">Localisation GPS</div>

            <div class="geo-quick">
              <div class="geo-text">
                <p>{{ geoLabel }}</p>
                <small>{{ geoSub }}</small>
              </div>
              <button type="button" class="geo-btn" (click)="localiser()" [disabled]="geoLoading">
                {{ geoLoading ? '...' : 'Ma position' }}
              </button>
            </div>

            <div class="edit-map-wrap">
              <div id="edit-map"></div>
              <div class="edit-map-hint">
                <i class="ti ti-info-circle"></i> Cliquez ou déplacez le repère pour ajuster la position exacte
              </div>
            </div>

            <div class="section-title">Photos du garage</div>

            <div class="photos-grid">
              @for (photo of galeriePhotos(); track photo; let i = $index) {
                <div class="photo-slot filled">
                  <img [src]="photo | mediaUrl" alt="Photo établissement">
                  <button type="button" class="photo-remove" (click)="retirerPhoto(i)">
                    <i class="ti ti-x"></i>
                  </button>
                </div>
              }
              @if (galeriePhotos().length < 6) {
                <div class="photo-slot add" (click)="galerieInput.click()">
                  @if (uploadingPhoto()) {
                    <i class="ti ti-loader-2 spin-icon"></i>
                  } @else {
                    <i class="ti ti-plus"></i>
                  }
                </div>
              }
              <input #galerieInput type="file" accept="image/*" hidden (change)="onGaleriePhotoSelected($event)">
            </div>

            <button type="submit" class="btn-save" [disabled]="saving">
              <i class="ti ti-device-floppy"></i>
              {{ saving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>

          </form>
        }

      </div>

    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Poppins', sans-serif; }

    .page {
      min-height: 100vh;
      background: var(--fg-bg);
      display: flex; flex-direction: column;
      padding-bottom: 64px;
    }

    .cover {
      width: 100%; height: 140px;
      background: linear-gradient(135deg, var(--fg-green), var(--fg-green-dark));
      position: relative; flex-shrink: 0;
      overflow: hidden;
    }
    .cover-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .cover-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.25); }

    .page-title { position: absolute; top: 18px; left: 20px; font-size: 18px; font-weight: 800; color: #fff; }
    .page-sub { position: absolute; top: 42px; left: 20px; font-size: 12px; color: rgba(255,255,255,.8); }

    .cover-edit-btn {
      position: absolute; top: 16px; right: 16px;
      background: rgba(255,255,255,.2); border: none; border-radius: 20px;
      padding: 7px 14px; font-size: 11px; font-weight: 600; color: #fff;
      font-family: 'Poppins', sans-serif; cursor: pointer;
      display: flex; align-items: center; gap: 5px;
      i { font-size: 14px; }
      &:hover { background: rgba(255,255,255,.3); }
    }

    .logo-wrap { position: absolute; bottom: -26px; left: 24px; }
    .logo-box {
      width: 68px; height: 68px; border-radius: 16px; background: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 800; color: var(--fg-green);
      border: 3px solid #fff; box-shadow: var(--fg-shadow-md);
      cursor: pointer; position: relative; overflow: hidden;
    }
    .logo-img { width: 100%; height: 100%; object-fit: cover; }
    .logo-edit {
      position: absolute; bottom: -2px; right: -2px;
      width: 22px; height: 22px; background: var(--fg-red);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      border: 2px solid #fff;
      i { font-size: 10px; color: #fff; }
    }

    .statut-wrap { position: absolute; bottom: -16px; right: 20px; }
    .statut-badge {
      font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px;
      &.valide { background: var(--fg-green-light); color: var(--fg-green-dark); border: 1.5px solid #c3e6d0; }
      &.pending { background: var(--fg-yellow-light); color: #a67f00; border: 1.5px solid var(--fg-yellow); }
      &.rejected { background: var(--fg-red-light); color: var(--fg-red); border: 1.5px solid #f6c9d1; }
    }

    .body {
      flex: 1; padding: 40px 24px 24px;
      display: flex; flex-direction: column; gap: 14px;
      max-width: 720px; width: 100%; margin: 0 auto;
    }

    .spinner {
      width: 32px; height: 32px; border: 3px solid var(--fg-border);
      border-top-color: var(--fg-green); border-radius: 50%;
      animation: spin .7s linear infinite; margin: 32px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin-icon { animation: spin 1s linear infinite; }

    .alert-error { background: var(--fg-red-light); color: var(--fg-red); padding: 11px 16px; border-radius: 10px; font-size: 12.5px; font-weight: 500; }
    .alert-success { background: var(--fg-green-light); color: var(--fg-green-dark); padding: 11px 16px; border-radius: 10px; font-size: 12.5px; font-weight: 500; }

    .stats-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .stat-card {
      background: #fff; border-radius: 12px; padding: 14px;
      text-align: center; border: 1px solid var(--fg-border);
    }
    .stat-num { font-size: 22px; font-weight: 800; color: var(--fg-green); }
    .stat-label { font-size: 11px; color: var(--fg-text-secondary); margin-top: 3px; }

    .section-title {
      font-size: 11px; font-weight: 700; color: var(--fg-green);
      text-transform: uppercase; letter-spacing: .5px;
      display: flex; align-items: center; gap: 8px;
      margin-top: 6px;
      &::after { content: ''; flex: 1; height: 1px; background: var(--fg-green-light); }
    }

    form { display: flex; flex-direction: column; gap: 14px; }

    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    .field-group { display: flex; flex-direction: column; gap: 5px; }
    .field-label { font-size: 10.5px; font-weight: 600; color: #555; letter-spacing: .3px; }

    .field-input {
      display: flex; align-items: center; gap: 8px;
      background: #fff; border: 1.5px solid var(--fg-border);
      border-radius: 12px; padding: 11px 13px; transition: border-color .2s;
      &.focused { border-color: var(--fg-green); i { color: var(--fg-green); } }
    }
    .field-input i { font-size: 15px; color: #aaa; transition: color .2s; }
    .field-input input, .field-input select, .field-input textarea {
      flex: 1; border: none; outline: none;
      font-family: 'Poppins', sans-serif; font-size: 13px; color: var(--fg-text); background: transparent;
    }
    .field-input textarea { resize: none; }
    .field-input input::placeholder, .field-input textarea::placeholder { color: #bbb; }

    .field-error { font-size: 11px; color: var(--fg-red); font-weight: 500; }

    .services-hint { font-size: 12px; color: #999; font-style: italic; padding: 8px 0; }
    .services-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .service-chip {
      display: inline-flex; align-items: center;
      padding: 8px 13px; border-radius: 999px;
      border: 1.5px solid var(--fg-border); background: #fff;
      font-size: 12px; font-weight: 600; color: #555;
      cursor: pointer; transition: all .15s; user-select: none;
      &:hover { border-color: var(--fg-green); }
      &.checked { background: var(--fg-green); border-color: var(--fg-green); color: #fff; }
    }

    .geo-quick {
      background: var(--fg-green-light); border: 1.5px solid #c3e6d0;
      border-radius: 12px; padding: 12px 14px;
      display: flex; align-items: center; gap: 10px;
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

    .edit-map-wrap {
      border-radius: 12px; overflow: hidden; border: 1px solid var(--fg-border);
    }
    #edit-map { width: 100%; height: 220px; }
    .edit-map-hint {
      background: #fff; padding: 8px 12px;
      font-size: 11px; color: var(--fg-text-secondary);
      display: flex; align-items: center; gap: 6px;
      i { color: var(--fg-green); font-size: 14px; }
    }

    .photos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .photo-slot {
      aspect-ratio: 1; border-radius: 10px; position: relative;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      overflow: hidden;

      &.filled { border: 1px solid var(--fg-border); }
      img { width: 100%; height: 100%; object-fit: cover; }
      &.add {
        background: var(--fg-green-light); border: 1.5px dashed var(--fg-green);
        i { font-size: 22px; color: var(--fg-green); }
      }
    }
    .photo-remove {
      position: absolute; top: 4px; right: 4px;
      width: 22px; height: 22px; border-radius: 50%;
      background: rgba(0,0,0,.6); border: none; color: #fff;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      i { font-size: 12px; }
    }

    .btn-save {
      background: var(--fg-green); color: #fff; border: none; border-radius: 12px;
      padding: 15px; font-size: 14px; font-weight: 700;
      font-family: 'Poppins', sans-serif; cursor: pointer; width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: opacity .2s;
      &:hover:not(:disabled) { opacity: .9; }
      &:disabled { opacity: .6; cursor: not-allowed; }
      i { font-size: 18px; }
    }

    @media (min-width: 768px) {
      .cover { height: 170px; }
      .body { padding: 56px 48px 32px; max-width: 900px; }
      .stats-row { grid-template-columns: repeat(2, 220px); }
    }
  `]
})
export class ProfilProEdit implements OnInit, OnDestroy {
  private categorieService = inject(CategorieService);
  private serviceService = inject(ServiceService);

  pro = signal<Professionnel | null>(null);
  form!: FormGroup;
  loading = false;
  saving = false;
  erreur = '';
  succes = '';
  geoLoading = false;
  geoLabel = 'Position enregistrée';
  geoSub = 'Cliquez ou déplacez le repère sur la carte';
  uploadingPhoto = signal(false);

  villes = VILLES;
  categories = signal<Categorie[]>([]);
  services = signal<Service[]>([]);
  servicesLoading = signal(false);
  galeriePhotos = signal<string[]>([]);

  private editMap?: L.Map;
  private editMarker?: L.Marker;

  constructor(
    private proService: ProfessionnelService,
    private fichierService: FichierService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.loading = true;

    this.categorieService.getAll().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.categories.set([]),
    });

    this.proService.getMonProfil().subscribe({
      next: (data) => {
        this.pro.set(data);
        this.galeriePhotos.set(data.galeriePhotos ?? []);
        this.initForm(data);
        this.loading = false;

        if (data.latitude && data.longitude) {
          this.geoSub = `${data.latitude.toFixed(4)}° N, ${data.longitude.toFixed(4)}° O`;
        }

        if (data.categorieId) {
          this.chargerServices(data.categorieId, data.serviceIds ?? []);
        }

        setTimeout(() => this.initEditMap());
      },
      error: () => { this.loading = false; },
    });
  }

  ngOnDestroy() {
    this.editMap?.remove();
  }

  initForm(p: Professionnel) {
    this.form = this.fb.group({
      nomEtablissement: [p.nomEtablissement, Validators.required],
      categorieId: [p.categorieId, Validators.required],
      serviceIds: [p.serviceIds ?? [], requireAtLeastOneService],
      description: [p.description, Validators.required],
      telephone: [p.telephone, [Validators.required, Validators.pattern(/^\d{8,10}$/)]],
      whatsapp: [p.whatsapp ?? ''],
      ville: [p.ville, Validators.required],
      horaires: [p.horaires, Validators.required],
      latitude: [p.latitude],
      longitude: [p.longitude],
    });

    this.form.get('categorieId')!.valueChanges.subscribe((categorieId) => {
      if (+categorieId !== p.categorieId) {
        this.form.get('serviceIds')!.setValue([]);
      }
      this.chargerServices(+categorieId, this.form.get('serviceIds')!.value);
    });
  }

  private chargerServices(categorieId: number, preselection: number[]): void {
    if (!categorieId) {
      this.services.set([]);
      return;
    }
    this.servicesLoading.set(true);
    this.serviceService.getByCategorie(categorieId).subscribe({
      next: (data) => {
        this.services.set(data);
        this.servicesLoading.set(false);
        if (preselection?.length) {
          this.form.get('serviceIds')!.setValue(preselection);
        }
      },
      error: () => {
        this.services.set([]);
        this.servicesLoading.set(false);
      },
    });
  }

  isServiceSelected(id: number): boolean {
    const current: number[] = this.form.get('serviceIds')?.value || [];
    return current.includes(id);
  }

  toggleService(id: number): void {
    const control = this.form.get('serviceIds')!;
    const current: number[] = control.value || [];
    control.setValue(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    control.markAsTouched();
  }

  private initEditMap(): void {
    const p = this.pro();
    const lat = p?.latitude || 12.3714;
    const lng = p?.longitude || -1.5197;

    this.editMap = L.map('edit-map', { center: [lat, lng], zoom: 15 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.editMap);

    this.editMarker = L.marker([lat, lng], { draggable: true }).addTo(this.editMap);

    this.editMarker.on('dragend', () => {
      const pos = this.editMarker!.getLatLng();
      this.updatePosition(pos.lat, pos.lng);
    });

    this.editMap.on('click', (e: L.LeafletMouseEvent) => {
      this.editMarker!.setLatLng(e.latlng);
      this.updatePosition(e.latlng.lat, e.latlng.lng);
    });
  }

  private updatePosition(lat: number, lng: number): void {
    this.form.patchValue({ latitude: lat, longitude: lng });
    this.geoLabel = 'Position mise à jour ✓';
    this.geoSub = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° O`;
  }

  localiser() {
    if (!navigator.geolocation) return;
    this.geoLoading = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.updatePosition(pos.coords.latitude, pos.coords.longitude);
        this.editMap?.setView([pos.coords.latitude, pos.coords.longitude], 15);
        this.editMarker?.setLatLng([pos.coords.latitude, pos.coords.longitude]);
        this.geoLoading = false;
      },
      () => {
        this.geoSub = 'Impossible de détecter la position';
        this.geoLoading = false;
      }
    );
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.fichierService.upload(file, 'LOGO').subscribe({
      next: (url) => {
        const p = this.pro();
        if (p) this.pro.set({ ...p, logoUrl: url });
      },
      error: () => { this.erreur = "Erreur lors de l'envoi du logo."; },
    });
  }

  onCoverSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.fichierService.upload(file, 'COUVERTURE').subscribe({
      next: (url) => {
        const p = this.pro();
        if (p) this.pro.set({ ...p, photoCouverture: url });
      },
      error: () => { this.erreur = "Erreur lors de l'envoi de la couverture."; },
    });
  }

  onGaleriePhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadingPhoto.set(true);
    this.fichierService.upload(file, 'GALERIE').subscribe({
      next: (url) => {
        this.galeriePhotos.update((list) => [...list, url]);
        this.uploadingPhoto.set(false);
      },
      error: () => {
        this.erreur = "Erreur lors de l'envoi de la photo.";
        this.uploadingPhoto.set(false);
      },
    });
  }

  retirerPhoto(index: number): void {
    this.galeriePhotos.update((list) => list.filter((_, i) => i !== index));
  }

  sauvegarder() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.erreur = '';
    this.succes = '';

    const p = this.pro();

    // NOTE: logoUrl, photoCouverture, galeriePhotos ne sont pas documentés dans le
    // contrat PUT /professionnels/profil — à confirmer avec Kéré qu'ils sont bien acceptés.
    this.proService.updateMonProfil({
      ...this.form.value,
      categorieId: +this.form.value.categorieId,
      logoUrl: p?.logoUrl,
      photoCouverture: p?.photoCouverture,
      galeriePhotos: this.galeriePhotos(),
    }).subscribe({
      next: (data) => {
        this.pro.set(data);
        this.succes = 'Modifications enregistrées avec succès !';
        this.saving = false;
      },
      error: (err) => {
        this.erreur = err.error?.erreur ?? 'Une erreur est survenue.';
        this.saving = false;
      },
    });
  }

  initiales(): string {
    const nom = this.pro()?.nomEtablissement ?? '';
    return nom.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  }
}