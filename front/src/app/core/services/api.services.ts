import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Avis,
  AvisRequest,
  NumeroUtile,
  Astuce,
  Professionnel,
  Categorie,
  Service,
  ServiceRequest,
  Publicite,
  PubliciteRequest,
  AnnonceDefilante,
  AnnonceDefilanteRequest,
  AdminCreateUtilisateurRequest,
} from '../models';

// ─── AVIS ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AvisService {
  private base = `${environment.apiUrl}/avis`;

  constructor(private http: HttpClient) {}

  poster(data: AvisRequest): Observable<Avis> {
    return this.http.post<Avis>(this.base, data);
  }

  getByPro(proId: number): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.base}/professionnel/${proId}`);
  }

  getMoyenne(proId: number): Observable<number> {
    return this.http.get<number>(`${this.base}/professionnel/${proId}/moyenne`);
  }

  verifierDejaPoste(proId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/verifier/${proId}`);
  }
}

// ─── NUMÉROS UTILES ────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class NumerosUtilesService {
  private base = `${environment.apiUrl}/public/numeros-utiles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<NumeroUtile[]> {
    return this.http.get<NumeroUtile[]>(this.base);
  }

  getByType(type: string): Observable<NumeroUtile[]> {
    return this.http.get<NumeroUtile[]>(`${this.base}/type/${type}`);
  }
}

// ─── ASTUCES ───────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AstucesService {
  private base = `${environment.apiUrl}/public/astuces`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Astuce[]> {
    return this.http.get<Astuce[]>(this.base);
  }
}

// ─── CATÉGORIES (PUBLIC) ───────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CategorieService {
  private base = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.base);
  }
}

// ─── SERVICES (PUBLIC) ─────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ServiceService {
  private base = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.base);
  }

  getByCategorie(categorieId: number): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.base}/categorie/${categorieId}`);
  }
}

// ─── PUBLICITÉS (PUBLIC — lecture carrousel accueil) ───────────────────────
@Injectable({ providedIn: 'root' })
export class PubliciteService {
  private base = `${environment.apiUrl}/publicites`;

  constructor(private http: HttpClient) {}

  getActives(): Observable<Publicite[]> {
    return this.http.get<Publicite[]>(`${this.base}/actives`);
  }
}

// ─── ANNONCE DÉFILANTE (PUBLIC — bande scrolling du header) ────────────────
// TODO: endpoint absent de la doc API fournie par Kéré, à confirmer/créer côté backend.
@Injectable({ providedIn: 'root' })
export class AnnonceService {
  private base = `${environment.apiUrl}/public/annonce-defilante`;

  constructor(private http: HttpClient) {}

  getActive(): Observable<AnnonceDefilante[]> {
    return this.http.get<AnnonceDefilante[]>(this.base);
  }
}

// ─── ADMIN ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Professionnels
  getPending(): Observable<Professionnel[]> {
    return this.http.get<Professionnel[]>(`${this.base}/professionnels/pending`);
  }

  valider(id: number, valider: boolean): Observable<any> {
    return this.http.put(`${this.base}/professionnel/${id}/validate`, null, {
      params: { valider: String(valider) },
    });
  }

  getAllProfessionnels(): Observable<Professionnel[]> {
    return this.http.get<Professionnel[]>(`${this.base}/professionnels`);
  }

  createProfessionnel(data: any): Observable<Professionnel> {
    return this.http.post<Professionnel>(`${this.base}/professionnels`, data);
  }

  updateProfessionnel(id: number, data: any): Observable<Professionnel> {
    return this.http.put<Professionnel>(`${this.base}/professionnels/${id}`, data);
  }

  deleteProfessionnel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/professionnels/${id}`);
  }

  // Utilisateurs
  getUtilisateurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/utilisateurs`);
  }

  createUtilisateur(data: AdminCreateUtilisateurRequest): Observable<any> {
    return this.http.post(`${this.base}/utilisateurs`, data);
  }

  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/utilisateurs/${id}`);
  }

  // Catégories
  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.base}/categories`);
  }

  createCategorie(data: { libelle: string; description?: string; icone: string }): Observable<Categorie> {
    return this.http.post<Categorie>(`${this.base}/categories`, data);
  }

  updateCategorie(id: number, data: { libelle: string; description?: string; icone: string }): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.base}/categories/${id}`, data);
  }

  deleteCategorie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/categories/${id}`);
  }

  // Services
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.base}/services`);
  }

  createService(data: ServiceRequest): Observable<Service> {
    return this.http.post<Service>(`${this.base}/services`, data);
  }

  updateService(id: number, data: ServiceRequest): Observable<Service> {
    return this.http.put<Service>(`${this.base}/services/${id}`, data);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/services/${id}`);
  }

  getServicesSansCategorie(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.base}/services/sans-categorie`);
  }

  affecterServiceACategorie(serviceId: number, categorieId: number): Observable<Service> {
    return this.http.put<Service>(`${this.base}/services/${serviceId}/affecter/${categorieId}`, null);
  }

  retirerServiceDeCategorie(serviceId: number): Observable<Service> {
    return this.http.put<Service>(`${this.base}/services/${serviceId}/retirer`, null);
  }

  // Astuces
  getAstuces(): Observable<Astuce[]> {
    return this.http.get<Astuce[]>(`${this.base}/astuces`);
  }

  createAstuce(data: { titre: string; contenu: string }): Observable<Astuce> {
    return this.http.post<Astuce>(`${this.base}/astuces`, data);
  }

  updateAstuce(id: number, data: { titre: string; contenu: string }): Observable<Astuce> {
    return this.http.put<Astuce>(`${this.base}/astuces/${id}`, data);
  }

  deleteAstuce(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/astuces/${id}`);
  }

  // Numéros utiles
  getNumerosUtiles(): Observable<NumeroUtile[]> {
    return this.http.get<NumeroUtile[]>(`${this.base}/numeros-utiles`);
  }

  createNumero(data: { nom: string; numero: string; type: string }): Observable<NumeroUtile> {
    return this.http.post<NumeroUtile>(`${this.base}/numeros-utiles`, data);
  }

  updateNumero(id: number, data: { nom: string; numero: string; type: string }): Observable<NumeroUtile> {
    return this.http.put<NumeroUtile>(`${this.base}/numeros-utiles/${id}`, data);
  }

  deleteNumero(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/numeros-utiles/${id}`);
  }

  // Publicités (espace publicitaire)
  getPublicites(): Observable<Publicite[]> {
    return this.http.get<Publicite[]>(`${this.base}/publicites`);
  }

  createPublicite(data: PubliciteRequest): Observable<Publicite> {
    return this.http.post<Publicite>(`${this.base}/publicites`, data);
  }

  updatePublicite(id: number, data: PubliciteRequest): Observable<Publicite> {
    return this.http.put<Publicite>(`${this.base}/publicites/${id}`, data);
  }

  deletePublicite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/publicites/${id}`);
  }

  // Annonce défilante (bandeau header)
  // TODO: endpoint absent de la doc API, à confirmer/créer côté backend.
  getAnnonceDefilante(): Observable<AnnonceDefilante> {
    return this.http.get<AnnonceDefilante>(`${this.base}/annonce-defilante`);
  }

  updateAnnonceDefilante(data: AnnonceDefilanteRequest): Observable<AnnonceDefilante> {
    return this.http.put<AnnonceDefilante>(`${this.base}/annonce-defilante`, data);
  }
}

// ─── FICHIERS ──────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class FichierService {
  private base = `${environment.apiUrl}/fichiers`;

  constructor(private http: HttpClient) {}

  upload(file: File, type: 'LOGO' | 'COUVERTURE' | 'GALERIE' | 'PUBLICITE'): Observable<string> {
    const form = new FormData();
    form.append('fichier', file);
    return this.http.post(`${this.base}/upload?type=${type}`, form, {
      responseType: 'text',
    });
  }

  getUrl(sousDossier: string, nomFichier: string): string {
    return `${this.base}/${sousDossier}/${nomFichier}`;
  }
}
