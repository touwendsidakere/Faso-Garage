import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Professionnel } from '../models';

@Injectable({ providedIn: 'root' })
export class ProfessionnelService {
  private base = `${environment.apiUrl}/professionnels`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Professionnel[]> {
    return this.http.get<Professionnel[]>(this.base);
  }

  search(keyword: string): Observable<Professionnel[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Professionnel[]>(`${this.base}/search`, { params });
  }

  getById(id: number): Observable<Professionnel> {
    return this.http.get<Professionnel>(`${this.base}/${id}`);
  }

  getMonProfil(): Observable<Professionnel> {
    return this.http.get<Professionnel>(`${this.base}/profil`);
  }

  updateMonProfil(data: Partial<Professionnel>): Observable<Professionnel> {
    return this.http.put<Professionnel>(`${this.base}/profil`, data);
  }
}