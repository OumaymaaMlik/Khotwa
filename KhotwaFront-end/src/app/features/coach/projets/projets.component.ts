import { Component } from '@angular/core';
import { ProjetService } from '../../../core/services/projet.service';
@Component({ selector:'app-coach-projets', templateUrl:'./projets.component.html', styleUrls:['./projets.component.css'] })
export class CoachProjetsComponent {
  constructor(public projetService: ProjetService) {}
  get projets() { return this.projetService.projets; }
}
