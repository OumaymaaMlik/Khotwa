import { Injectable } from '@angular/core';
import { Projet, ProjetStatut } from '../models';

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
  private _projets: Projet[] = [...MOCK];

  get projets(): Projet[] { return this._projets; }
  get projetsActifs(): Projet[] { return this._projets.filter(p => p.statut === 'in_progress'); }

  getById(id: string): Projet | undefined { return this._projets.find(p => p.id === id); }
  updateStatut(id: string, statut: ProjetStatut): void {
    const p = this._projets.find(p => p.id === id);
    if (p) { p.statut = statut; p.updatedAt = new Date(); }
  }
  delete(id: string): void { this._projets = this._projets.filter(p => p.id !== id); }
}
