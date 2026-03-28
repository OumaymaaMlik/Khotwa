import { Component } from '@angular/core';
@Component({ selector:'app-admin-abonnements', templateUrl:'./abonnements.component.html', styleUrls:['./abonnements.component.css'] })
export class AdminAbonnementsComponent {
  filtre = 'tous';
  abonnements = [
    {id:'a1',user:'Sara Trabelsi',email:'sara@startup.tn',plan:'premium',statut:'actif',debut:'2024-09-01',fin:'2025-09-01'},
    {id:'a2',user:'Omar Chaabane',email:'omar@agri.tn',plan:'gratuit',statut:'actif',debut:'2024-10-15',fin:'2025-10-15'},
    {id:'a3',user:'Nadia Ben Ali',email:'nadia@edu.tn',plan:'institutionnel',statut:'expire',debut:'2023-11-01',fin:'2024-11-01'},
    {id:'a4',user:'Hedi Slim',email:'hedi@btp.tn',plan:'premium',statut:'actif',debut:'2024-08-01',fin:'2025-08-01'},
  ];
  get filteredAbonnements() { return this.filtre==='tous' ? this.abonnements : this.abonnements.filter(a=>a.plan===this.filtre); }
}
