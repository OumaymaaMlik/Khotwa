import { Component } from '@angular/core';
import { ProjetService } from '../../../core/services/projet.service';

@Component({ selector:'app-admin-dashboard', templateUrl:'./dashboard.component.html', styleUrls:['./dashboard.component.css'] })
export class AdminDashboardComponent {
  constructor(public projetService: ProjetService) {}
  get projets() { return this.projetService.projets; }
  get stats() {
    return {
      totalProjets: this.projets.length,
      enCours: this.projets.filter(p=>p.statut==='in_progress').length,
      utilisateurs: 24, events: 3, abonnements: 18, talents: 12,
    };
  }
}
