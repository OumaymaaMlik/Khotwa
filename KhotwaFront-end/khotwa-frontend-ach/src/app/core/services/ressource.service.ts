import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type AccessLevel    = 'PUBLIC' | 'INCUBES' | 'PAYANT';
export type ResourceType   = 'PDF' | 'VIDEO' | 'EXCEL' | 'WORD' | 'IMAGE' | 'LINK';
export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Ressource {
  id: number;
  titre: string;
  description: string;
  type: ResourceType;
  niveauAcces: AccessLevel;
  urlFichier: string;
  nomFichierOriginal: string;
  mimeType: string;
  tailleFichierOctets: number;
  tailleFormatee: string;
  dureeSec: number;
  nombrePages: number;
  publie: boolean;
  vues: number;
  telechargements: number;
  categorie: { id: number; nom: string; couleur: string; icone: string } | null;
  tags: { id: number; nom: string }[];
  createdAt: string;
  maProgression: { statut: ProgressStatus; pourcentage: number } | null;
  urlExterne?: string;
}

export interface Categorie {
  id: number; nom: string; description: string; couleur: string; icone: string;
}

@Injectable({ providedIn: 'root' })
export class RessourceService {

  private api = 'http://localhost:8084/khotwa/api';

  constructor(private http: HttpClient) {}

  // ── Headers de Sécurité ──────────────────────────────────────────
  private h(userId = 1, role = 'ADMIN', incube = true, premium = true): HttpHeaders {
    return new HttpHeaders({
      'X-User-Id':      String(userId),
      'X-User-Role':    role,
      'X-User-Incube':  String(incube),
      'X-User-Premium': String(premium),
    });
  }

  getApiOrigin(): string {
    return this.api;
  }

  // ── Ressources ──────────────────────────────────────────────────
  getRessourcesHttp(filters: any = {}): Observable<any> {
    let params = new HttpParams()
      .set('page', String(filters.page ?? 0))
      .set('size', String(filters.size ?? 50));
      
    if (filters.type && filters.type !== 'ALL') params = params.set('type', filters.type);
    if (filters.access && filters.access !== 'ALL') params = params.set('niveauAcces', filters.access);
    if (filters.categorieId) params = params.set('categorieId', String(filters.categorieId));
    if (filters.search) params = params.set('search', filters.search);

    return this.http.get<any>(`${this.api}/ressources`, {
      params,
      headers: this.h(filters.userId, filters.role, filters.incube, filters.premium)
    });
  }

  getRessourceByIdHttp(id: number, userId = 1, role = 'ADMIN'): Observable<any> {
    return this.http.get<any>(`${this.api}/ressources/${id}`, { headers: this.h(userId, role) });
  }

  createRessourceHttp(fd: FormData, adminId = 1): Observable<any> {
    return this.http.post<any>(`${this.api}/ressources`, fd, {
      headers: new HttpHeaders({ 'X-User-Id': String(adminId), 'X-User-Role': 'ADMIN' })
    });
  }

  updateRessourceHttp(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.api}/ressources/${id}`, body, { headers: this.h() });
  }

  togglePublieHttp(id: number): Observable<any> {
    return this.http.patch<any>(`${this.api}/ressources/${id}/toggle-publie`, {}, { headers: this.h() });
  }

  deleteRessourceHttp(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/ressources/${id}`, { headers: this.h() });
  }

  // ── Statistiques ─────────────────────────────────────────────────
  getStatsHttp(userId = 1): Observable<any> {
    return this.http.get<any>(`${this.api}/ressources/stats`, { headers: this.h(userId) });
  }

  // ── Progression ──────────────────────────────────────────────────
  updateProgressionHttp(userId: number, ressourceId: number, statut: ProgressStatus, pourcentage: number): Observable<any> {
    return this.http.post<any>(`${this.api}/progressions`, 
      { ressourceId, statut, pourcentage }, 
      { headers: this.h(userId) }
    );
  }

  marquerTermineHttp(userId: number, ressourceId: number): Observable<any> {
    return this.http.post<any>(`${this.api}/progressions/${ressourceId}/terminer`, {}, { headers: this.h(userId) });
  }

  saveVideoProgressionHttp(userId: number, ressourceId: number, statut: ProgressStatus, pourcentage: number, positionVideoSec: number): Observable<any> {
    return this.http.post<any>(`${this.api}/progressions`,
      { ressourceId, statut, pourcentage, positionVideoSec },
      { headers: this.h(userId) }
    );
  }

  getMesProgressionsHttp(userId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/progressions/mes`, { headers: this.h(userId) });
  }

  // ── Catégories ───────────────────────────────────────────────────
  getCategoriesHttp(): Observable<any> {
    return this.http.get<any>(`${this.api}/categories`);
  }

  createCategorieHttp(body: any): Observable<any> {
    return this.http.post<any>(`${this.api}/categories`, body, { headers: this.h() });
  }

  updateCategorieHttp(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.api}/categories/${id}`, body, { headers: this.h() });
  }

  deleteCategorieHttp(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/categories/${id}`, { headers: this.h() });
  }

  // ── Utilitaires ──────────────────────────────────────────────────
  downloadAsBlob(ressourceId: number, userId: number, role: string): Observable<Blob> {
    return this.http.get(`${this.api}/ressources/${ressourceId}/download`, {
        headers: this.h(userId, role),
        responseType: 'blob'
    });
  }

  buildFormData(form: any, fichier: File | null): FormData {
    const fd = new FormData();
    Object.keys(form).forEach(key => {
      if (form[key] !== null && form[key] !== undefined) {
        fd.append(key, String(form[key]));
      }
    });
    if (fichier) fd.append('fichier', fichier, fichier.name);
    return fd;
  }
}