import { Component } from '@angular/core';
import { ProjetService } from '../../../core/services/projet.service';
@Component({ selector:'app-entrepreneur-projets', templateUrl:'./projets.component.html', styleUrls:['./projets.component.css'] })
export class EntrepreneurProjetsComponent {
  filtre = 'tous';
  constructor(public projetService: ProjetService) {}
  get filteredProjets() {
    const l = this.projetService.projets;
    return this.filtre === 'tous' ? l : l.filter(p => p.statut === this.filtre);
  }
}
