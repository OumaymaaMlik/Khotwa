import { Component } from '@angular/core';
@Component({ selector:'app-admin-utilisateurs', templateUrl:'./utilisateurs.component.html', styleUrls:['./utilisateurs.component.css'] })
export class AdminUtilisateursComponent {
  filtre = 'tous'; search = '';
  users = [
    {id:'u1',nom:'Bensalem',prenom:'Karim',email:'admin@khotwa.tn',role:'admin',statut:'actif',createdAt:'2024-01-01'},
    {id:'u2',nom:'Trabelsi',prenom:'Sara',email:'sara@startup.tn',role:'entrepreneur',statut:'actif',createdAt:'2024-02-15'},
    {id:'u3',nom:'Mansouri',prenom:'Ahmed',email:'ahmed@coach.tn',role:'coach',statut:'actif',createdAt:'2024-03-01'},
    {id:'u4',nom:'Ben Ali',prenom:'Nadia',email:'nadia@edu.tn',role:'entrepreneur',statut:'inactif',createdAt:'2024-04-10'},
    {id:'u5',nom:'Chaabane',prenom:'Omar',email:'omar@agri.tn',role:'entrepreneur',statut:'actif',createdAt:'2024-05-20'},
  ];
  get filteredUsers() {
    let l = this.users;
    if (this.filtre !== 'tous') l = l.filter(u => u.role === this.filtre);
    if (this.search) l = l.filter(u => (u.nom+' '+u.prenom+' '+u.email).toLowerCase().includes(this.search.toLowerCase()));
    return l;
  }
}
