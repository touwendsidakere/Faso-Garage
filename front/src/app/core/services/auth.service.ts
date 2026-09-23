import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterUserRequest,
  RegisterProRequest,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'fg_token';
  private readonly USER_KEY = 'fg_user';

  currentUser = signal<LoginResponse | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap((res) => this.storeSession(res)));
  }

  registerUser(data: RegisterUserRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(tap((res) => this.storeSession(res)));
  }

  registerPro(data: RegisterProRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(tap((res) => this.storeSession(res)));
  }

  me(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${environment.apiUrl}/auth/me`);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/connexion']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return this.currentUser()?.role ?? null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'ROLE_ADMIN';
  }

  isPro(): boolean {
    return this.getRole() === 'ROLE_PRO';
  }

  isUser(): boolean {
    return this.getRole() === 'ROLE_USER';
  }

  private storeSession(res: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res));
    this.currentUser.set(res);
  }

  private loadUser(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}