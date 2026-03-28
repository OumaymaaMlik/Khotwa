import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export type AccessLevel = 'PUBLIC' | 'INCUBES' | 'PAYANT';
export type ResourceType = 'PDF' | 'VIDEO' | 'EXCEL' | 'WORD' | 'IMAGE' | 'LINK';
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

export interface Categorie { id: number; nom: string; description: string; couleur: string; icone: string; }

@Injectable({ providedIn: 'root' })
export class RessourceService {
  private apiUrl = 'http://localhost:8084/khotwa/api';

  // Mock data for offline dev
  private mockRessources: Ressource[] = [
    { id:1, titre:'Business Plan Guide', description:'Complete business plan template for Tunisian startups.', type:'PDF', niveauAcces:'INCUBES', urlFichier:'/khotwa/api/ressources/1/download', nomFichierOriginal:'bp.pdf', mimeType:'application/pdf', tailleFichierOctets:2400000, tailleFormatee:'2.4 MB', dureeSec:0, nombrePages:45, publie:true, vues:34, telechargements:12, categorie:{id:1,nom:'Strategy',couleur:'#E8622A',icone:'📁'}, tags:[{id:1,nom:'BMC'}], createdAt:'2024-01-01', maProgression:{statut:'COMPLETED',pourcentage:100} },
    { id:2, titre:'BMC Excel Template', description:'Interactive Excel file to build your Business Model Canvas.', type:'EXCEL', niveauAcces:'PUBLIC', urlFichier:'/khotwa/api/ressources/2/download', nomFichierOriginal:'bmc.xlsx', mimeType:'application/vnd.ms-excel', tailleFichierOctets:850000, tailleFormatee:'850 KB', dureeSec:0, nombrePages:0, publie:true, vues:87, telechargements:45, categorie:{id:4,nom:'Tools',couleur:'#27AE7A',icone:'🛠️'}, tags:[{id:1,nom:'BMC'},{id:4,nom:'Excel'}], createdAt:'2024-01-15', maProgression:null },
    { id:3, titre:'Masterclass: Pitch Your Startup', description:'45-min video — Dr. Ben Salem explains how to build an unforgettable pitch deck.', type:'VIDEO', niveauAcces:'PAYANT', urlFichier:'/khotwa/api/ressources/3/download', nomFichierOriginal:'pitch.mp4', mimeType:'video/mp4', tailleFichierOctets:250000000, tailleFormatee:'250 MB', dureeSec:2700, nombrePages:0, publie:true, vues:120, telechargements:67, categorie:{id:3,nom:'Training',couleur:'#2ABFBF',icone:'🎓'}, tags:[{id:2,nom:'Pitch'}], createdAt:'2024-02-01', maProgression:{statut:'IN_PROGRESS',pourcentage:60} },
    { id:4, titre:'SARL Legal Guide (Tunisia)', description:'7 legal steps to register your company — updated 2024.', type:'PDF', niveauAcces:'INCUBES', urlFichier:'/khotwa/api/ressources/4/download', nomFichierOriginal:'sarl.pdf', mimeType:'application/pdf', tailleFichierOctets:1200000, tailleFormatee:'1.2 MB', dureeSec:0, nombrePages:28, publie:true, vues:56, telechargements:23, categorie:{id:2,nom:'Legal',couleur:'#7C5CBF',icone:'⚖️'}, tags:[{id:3,nom:'SARL'}], createdAt:'2024-02-15', maProgression:{statut:'NOT_STARTED',pourcentage:0} },
    { id:5, titre:'Marketing Strategy Template', description:'Word document template for building your go-to-market strategy.', type:'WORD', niveauAcces:'PUBLIC', urlFichier:'/khotwa/api/ressources/5/download', nomFichierOriginal:'marketing.docx', mimeType:'application/msword', tailleFichierOctets:450000, tailleFormatee:'450 KB', dureeSec:0, nombrePages:12, publie:false, vues:0, telechargements:0, categorie:{id:1,nom:'Strategy',couleur:'#E8622A',icone:'📁'}, tags:[], createdAt:'2024-03-01', maProgression:null },
  ];

  private mockCategories: Categorie[] = [
    {id:1,nom:'Strategy',description:'Business strategy resources',couleur:'#E8622A',icone:'📁'},
    {id:2,nom:'Legal',description:'Legal guides and templates',couleur:'#7C5CBF',icone:'⚖️'},
    {id:3,nom:'Training',description:'Video courses and webinars',couleur:'#2ABFBF',icone:'🎓'},
    {id:4,nom:'Tools',description:'Templates and tools',couleur:'#27AE7A',icone:'🛠️'},
  ];

  constructor(private http: HttpClient) {}

  getRessources(filters?: any): Ressource[] {
    let list = [...this.mockRessources];
    if (filters?.type && filters.type !== 'ALL') list = list.filter(r => r.type === filters.type);
    if (filters?.access && filters.access !== 'ALL') list = list.filter(r => r.niveauAcces === filters.access);
    if (filters?.search) list = list.filter(r => r.titre.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters?.publie !== undefined) list = list.filter(r => r.publie === filters.publie);
    return list;
  }

  getRessourceById(id: number): Ressource | undefined {
    return this.mockRessources.find(r => r.id === id);
  }

  addRessource(r: Partial<Ressource>): void {
    const newR = { ...r, id: Date.now(), vues: 0, telechargements: 0, createdAt: new Date().toISOString(), maProgression: null } as Ressource;
    this.mockRessources.push(newR);
  }

  updateRessource(id: number, changes: Partial<Ressource>): void {
    const idx = this.mockRessources.findIndex(r => r.id === id);
    if (idx !== -1) this.mockRessources[idx] = { ...this.mockRessources[idx], ...changes };
  }

  deleteRessource(id: number): void {
    this.mockRessources = this.mockRessources.filter(r => r.id !== id);
  }

  togglePublie(id: number): void {
    const r = this.mockRessources.find(r => r.id === id);
    if (r) r.publie = !r.publie;
  }

  updateProgression(id: number, statut: ProgressStatus, pourcentage: number): void {
    const r = this.mockRessources.find(r => r.id === id);
    if (r) r.maProgression = { statut, pourcentage };
  }

  getCategories(): Categorie[] { return this.mockCategories; }

  getStats() {
    const all = this.mockRessources;
    return {
      total: all.length,
      published: all.filter(r => r.publie).length,
      public: all.filter(r => r.niveauAcces === 'PUBLIC').length,
      incubes: all.filter(r => r.niveauAcces === 'INCUBES').length,
      payant: all.filter(r => r.niveauAcces === 'PAYANT').length,
      pdf: all.filter(r => r.type === 'PDF').length,
      video: all.filter(r => r.type === 'VIDEO').length,
      excel: all.filter(r => r.type === 'EXCEL').length,
    };
  }
}
