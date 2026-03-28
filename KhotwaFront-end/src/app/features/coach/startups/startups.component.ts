import { Component } from '@angular/core';
import { ProjetService } from '../../../core/services/projet.service';
@Component({ selector:'app-coach-startups', templateUrl:'./startups.component.html', styleUrls:['./startups.component.css'] })
export class CoachStartupsComponent {
  constructor(public projetService: ProjetService) {}
  get projets() { return this.projetService.projets; }
}
