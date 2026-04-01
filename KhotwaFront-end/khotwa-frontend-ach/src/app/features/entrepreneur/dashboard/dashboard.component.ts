import { Component } from '@angular/core';
import { ProjetService } from '../../../core/services/projet.service';

@Component({ selector:'app-entrepreneur-dashboard', templateUrl:'./dashboard.component.html', styleUrls:['./dashboard.component.css'] })
export class EntrepreneurDashboardComponent {
  constructor(public projetService: ProjetService) {}
  get projets() { return this.projetService.projets; }
  enCours = 2; tachesTerminees = 11; tachesTotal = 18; progression = 54;
}
