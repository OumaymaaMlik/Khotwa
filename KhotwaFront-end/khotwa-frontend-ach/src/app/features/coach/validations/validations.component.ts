import { Component } from '@angular/core';
@Component({ selector:'app-coach-validations', templateUrl:'./validations.component.html', styleUrls:['./validations.component.css'] })
export class CoachValidationsComponent {
  validations = [
    {id:'v1',tache:'Prototype UI — E-Learning',startup:'EduTech Pro (Sara)',doc:'maquette_v2.pdf',statut:'en_attente',date:'2024-12-01'},
    {id:'v2',tache:'Tests QA HealthMobile',startup:'HealthMobile (Sara)',doc:'rapport_tests.pdf',statut:'en_attente',date:'2024-12-02'},
    {id:'v3',tache:'Business Plan AgriSmart',startup:'AgriSmart (Sara)',doc:'business_plan_v3.pdf',statut:'valide',date:'2024-11-28'},
  ];
  validate(id: string) { const v = this.validations.find(x=>x.id===id); if(v) v.statut='valide'; }
  reject(id: string) { const v = this.validations.find(x=>x.id===id); if(v) v.statut='rejete'; }
}
