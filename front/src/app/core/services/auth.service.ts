import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Keycloak from 'keycloak-js';

/**
 * DTOs
 */
export interface RegisterRequest {
  nom: string;
  prenom: string;
  telephone: string;
  motDePasse: string;
  role?: string;
  email?: string;
  nomEtablissement?: string;
  categorieId?: number;
  serviceIds?: number[];
  description?: string;
  telephonePro?: string;
  whatsapp?: string;
  latitude?: number;
  longitude?: number;
  ville?: string;
  horaires?: string;
}

export interface AuthResponse {
  telephone: string;
  email?: string;
  nom: string;
  prenom: string;
  role: string;
  userId: number;
}

export interface CurrentUser {
  telephone?: string;
  email?: string;
  nom?: string;
  prenom?: string;
  role?: string;
  userId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:8080/api';

  // ============================================================
  // SIGNAL : utilisateur connecté
  // ============================================================

  /**
   * Signal contenant les infos de l'utilisateur connecté (depuis Keycloak).
   * Utilisé dans les templates Angular : `auth.currentUser()?.email`
   */
  currentUser = signal<CurrentUser | null>(null);

  constructor() {
    this.refreshCurrentUser();
  }

  /**
   * Rafraîchit le signal `currentUser` à partir du token Keycloak.
   * À appeler après login/logout.
   */
  refreshCurrentUser(): void {
    if (this.keycloak.authenticated && this.keycloak.tokenParsed) {
      const parsed = this.keycloak.tokenParsed;
      const roles = this.getUserRoles();
      const role = roles.includes('ADMIN') ? 'ROLE_ADMIN'
                 : roles.includes('PRO')   ? 'ROLE_PRO'
                 : 'ROLE_USER';

      this.currentUser.set({
        telephone: parsed['preferred_username'],
        email:     parsed['email'],
        nom:       parsed['family_name'],
        prenom:    parsed['given_name'],
        role:      role,
        userId:    undefined
      });
    } else {
      this.currentUser.set(null);
    }
  }

  // ============================================================
  // AUTHENTIFICATION KEYCLOAK
  // ============================================================

  login(): void {
    this.keycloak.login({
      redirectUri: window.location.origin + '/'
    });
  }

  logout(): void {
    this.keycloak.logout({
      redirectUri: window.location.origin
    });
  }

  isLoggedIn(): boolean {
    return this.keycloak.authenticated ?? false;
  }

  async getToken(): Promise<string | undefined> {
    if (!this.keycloak.authenticated) return undefined;
    try {
      await this.keycloak.updateToken(30);
      return this.keycloak.token;
    } catch {
      this.logout();
      return undefined;
    }
  }

  getUserRoles(): string[] {
    return this.keycloak.realmAccess?.roles ?? [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  // ============================================================
  // MÉTHODES DE RÔLE (utilisées dans les templates)
  // ============================================================

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isPro(): boolean {
    return this.hasRole('PRO');
  }

  isUser(): boolean {
    return this.hasRole('USER');
  }

  /**
   * Récupère le rôle principal sous forme "ROLE_XXX"
   */
  getRole(): string {
    const roles = this.getUserRoles();
    if (roles.includes('ADMIN')) return 'ROLE_ADMIN';
    if (roles.includes('PRO'))   return 'ROLE_PRO';
    return 'ROLE_USER';
  }

  // ============================================================
  // INFOS UTILISATEUR
  // ============================================================

  getUsername(): string | undefined {
    return this.keycloak.tokenParsed?.['preferred_username'];
  }

  getFullName(): string {
    const parsed = this.keycloak.tokenParsed;
    if (!parsed) return '';
    return `${parsed['given_name'] ?? ''} ${parsed['family_name'] ?? ''}`.trim();
  }

  // ============================================================
  // INSCRIPTION (Option B : via le backend)
  // ============================================================

  registerUser(data: RegisterRequest): Observable<AuthResponse> {
    const payload: RegisterRequest = { ...data, role: 'ROLE_USER' };
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, payload);
  }

  registerPro(data: RegisterRequest): Observable<AuthResponse> {
    const payload: RegisterRequest = { ...data, role: 'ROLE_PRO' };
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, payload);
  }

  // ============================================================
  // APPEL API : infos utilisateur (backend)
  // ============================================================

  getCurrentUser(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API_URL}/auth/me`);
  }
}