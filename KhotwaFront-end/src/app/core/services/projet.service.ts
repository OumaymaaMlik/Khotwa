import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Projet, ProjetStatut } from '../models';
import { Observable, catchError, map, of, tap } from 'rxjs';

const MOCK: Projet[] = [
  { id:'p1', titre:'Plateforme E-Learning', description:'Application mobile de formation en ligne', statut:'in_progress', progression:65, entrepreneurId:'u2', coachId:'u3', etapes:[
    {id:'e1',titre:'Market Research',ordre:1,projetId:'p1',dateDebut:new Date('2024-01-01'),dateFin:new Date('2024-01-31'),taches:[]},
    {id:'e2',titre:'MVP Development',ordre:2,projetId:'p1',dateDebut:new Date('2024-02-01'),dateFin:new Date('2024-04-30'),taches:[]},
    {id:'e3',titre:'Tests & Validation',ordre:3,projetId:'p1',dateDebut:new Date('2024-05-01'),dateFin:new Date('2024-06-30'),taches:[]},
  ], createdAt:new Date('2024-01-01'), updatedAt:new Date('2024-11-20') },
  { id:'p2', titre:'HealthMobile App', description:'Health app for patient tracking', statut:'in_progress', progression:30, entrepreneurId:'u2', coachId:'u3', etapes:[], createdAt:new Date('2024-03-01'), updatedAt:new Date('2024-11-18') },
  { id:'p3', titre:'BTP Connect', description:'Construction materials marketplace', statut:'completed', progression:100, entrepreneurId:'u2', etapes:[], createdAt:new Date('2023-06-01'), updatedAt:new Date('2024-10-01') },
  { id:'p4', titre:'AgriSmart', description:'IoT for connected agriculture', statut:'suspended', progression:20, entrepreneurId:'u2', coachId:'u3', etapes:[], createdAt:new Date('2024-08-01'), updatedAt:new Date('2024-11-01') },
];

@Injectable({ providedIn: 'root' })
export class ProjetService {
  private apiUrl = 'http://localhost:8080/api/projets';
  private _projets: Projet[] = [...MOCK];

  constructor(private http: HttpClient) {}

  get projets(): Projet[] { return this._projets; }
  get projetsActifs(): Projet[] { return this._projets.filter(p => p.statut === 'in_progress'); }

  loadProjets(): Observable<Projet[]> {
    return this.http.get<BackendProjetResponse[]>(this.apiUrl).pipe(
      map((items) => items.map((item) => this.mapBackendProjetToFront(item))),
      tap((items) => {
        this._projets = items;
      }),
      catchError(() => of(this._projets)),
    );
  }

  createProject(request: CreateProjetPayload, entrepreneurId: string): Observable<Projet> {
    const payload: BackendProjetRequest = {
      nom: request.nom,
      description: request.description,
      statut: this.mapFrontStatutToBackend(request.statut),
      tachesInitiales: request.tachesInitiales.map((task) => ({
        titre: task.titre,
        description: task.description,
        priorite: task.priorite,
        statut: task.statut,
        dateLimite: task.dateLimite || null,
      })),
    };

    return this.http.post<BackendProjetResponse>(this.apiUrl, payload).pipe(
      map((item) => this.mapBackendProjetToFront(item, entrepreneurId)),
      tap((created) => {
        this._projets = [created, ...this._projets];
      }),
    );
  }

  getById(id: string): Projet | undefined { return this._projets.find(p => p.id === id); }
  updateStatut(id: string, statut: ProjetStatut): void {
    const p = this._projets.find(p => p.id === id);
    if (p) { p.statut = statut; p.updatedAt = new Date(); }
  }
  delete(id: string): void { this._projets = this._projets.filter(p => p.id !== id); }

  private mapFrontStatutToBackend(statut: ProjetStatut): BackendProjetStatut {
    if (statut === 'completed') return 'TERMINE';
    if (statut === 'suspended') return 'SUSPENDU';
    return 'EN_COURS';
  }

  private mapBackendStatutToFront(statut: BackendProjetStatut): ProjetStatut {
    if (statut === 'TERMINE') return 'completed';
    if (statut === 'SUSPENDU') return 'suspended';
    return 'in_progress';
  }

  private mapBackendProjetToFront(item: BackendProjetResponse, entrepreneurId: string = 'u2'): Projet {
    const total = item.taches?.length ?? 0;
    const completed = (item.taches ?? []).filter((task) => task.statut === 'TERMINEE').length;
    const progression = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      id: String(item.id),
      titre: item.nom,
      description: item.description ?? '',
      statut: this.mapBackendStatutToFront(item.statut),
      progression,
      entrepreneurId,
      etapes: [
        {
          id: `api-stage-${item.id}`,
          titre: 'Initial Tasks',
          ordre: 1,
          projetId: String(item.id),
          taches: (item.taches ?? []).map((task) => ({
            id: String(task.id),
            titre: task.titre,
            description: task.description ?? '',
            statut: this.mapBackendTaskStatutToFront(task.statut),
            priorite: this.mapBackendTaskPrioriteToFront(task.priorite),
            deadline: task.dateLimite ? new Date(task.dateLimite) : new Date(),
            sousTaches: [],
            documents: [],
            etapeId: `api-stage-${item.id}`,
            projetId: String(item.id),
            slaJours: 0,
            derniereMaj: task.dateMiseAJour ? new Date(task.dateMiseAJour) : new Date(),
          })),
          dateDebut: item.dateCreation ? new Date(item.dateCreation) : new Date(),
          dateFin: item.dateMiseAJour ? new Date(item.dateMiseAJour) : new Date(),
        },
      ],
      createdAt: item.dateCreation ? new Date(item.dateCreation) : new Date(),
      updatedAt: item.dateMiseAJour ? new Date(item.dateMiseAJour) : new Date(),
    };
  }

  private mapBackendTaskStatutToFront(statut: BackendTacheStatut): 'a_faire' | 'in_progress' | 'en_attente_validation' | 'completede' {
    if (statut === 'TERMINEE') return 'completede';
    if (statut === 'EN_COURS') return 'in_progress';
    if (statut === 'BLOQUEE') return 'en_attente_validation';
    return 'a_faire';
  }

  private mapBackendTaskPrioriteToFront(priorite: BackendTachePriorite): 'basse' | 'normale' | 'haute' | 'critical' {
    if (priorite === 'HAUTE') return 'haute';
    if (priorite === 'BASSE') return 'basse';
    return 'normale';
  }
}

type BackendProjetStatut = 'EN_COURS' | 'SUSPENDU' | 'TERMINE';
type BackendTacheStatut = 'A_FAIRE' | 'EN_COURS' | 'BLOQUEE' | 'TERMINEE';
type BackendTachePriorite = 'BASSE' | 'MOYENNE' | 'HAUTE';

interface BackendTacheResponse {
  id: number;
  titre: string;
  description: string | null;
  priorite: BackendTachePriorite;
  statut: BackendTacheStatut;
  dateLimite: string | null;
  dateCreation: string;
  dateMiseAJour: string;
  projetId: number;
}

interface BackendProjetResponse {
  id: number;
  nom: string;
  description: string | null;
  statut: BackendProjetStatut;
  dateCreation: string;
  dateMiseAJour: string;
  taches: BackendTacheResponse[];
}

interface BackendTacheRequest {
  titre: string;
  description: string;
  priorite: BackendTachePriorite;
  statut: BackendTacheStatut;
  dateLimite: string | null;
}

interface BackendProjetRequest {
  nom: string;
  description: string;
  statut: BackendProjetStatut;
  tachesInitiales: BackendTacheRequest[];
}

export interface CreateProjetTaskPayload {
  titre: string;
  description: string;
  priorite: BackendTachePriorite;
  statut: BackendTacheStatut;
  dateLimite: string;
}

export interface CreateProjetPayload {
  nom: string;
  description: string;
  statut: ProjetStatut;
  tachesInitiales: CreateProjetTaskPayload[];
}
