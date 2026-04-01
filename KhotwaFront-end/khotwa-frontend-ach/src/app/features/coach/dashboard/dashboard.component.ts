import { Component } from '@angular/core';
import { ProjetService } from '../../../core/services/projet.service';
@Component({ selector:'app-coach-dashboard', templateUrl:'./dashboard.component.html', styleUrls:['./dashboard.component.css'] })
export class CoachDashboardComponent {
  constructor(public projetService: ProjetService) {}
  get projets() { return this.projetService.projets; }
  validations = [
    {id:'v1',tache:'Prototype UI — E-Learning',startup:'EduTech Pro (Sara)',doc:'maquette_v2.pdf'},
    {id:'v2',tache:'Tests QA HealthMobile',startup:'HealthMobile (Sara)',doc:'rapport_tests.pdf'},
  ];
}
