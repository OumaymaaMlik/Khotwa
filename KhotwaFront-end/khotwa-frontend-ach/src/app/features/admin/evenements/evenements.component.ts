import { Component } from '@angular/core';
@Component({ selector:'app-admin-evenements', templateUrl:'./evenements.component.html', styleUrls:['./evenements.component.css'] })
export class AdminEvenementsComponent {
  filtre = 'tous';
  events = [
    {id:'ev1',titre:'Atelier Pitch Day',type:'pitch',date:'2024-12-10',heure:'14h00',intervenant:'Dr. Ben Salem',places:30,restantes:8},
    {id:'ev2',titre:'Webinar BMC',type:'webinar',date:'2024-12-15',heure:'10h00',intervenant:'Sara Coach',places:50,restantes:0},
    {id:'ev3',titre:'Training Design Thinking',type:'formation',date:'2024-12-20',heure:'09h00',intervenant:'Ahmed Mansouri',places:20,restantes:5},
    {id:'ev4',titre:'Group Coaching Session',type:'coaching',date:'2025-01-08',heure:'15h00',intervenant:'KHOTWA Team',places:15,restantes:12},
  ];
  get filteredEvents() { return this.filtre==='tous' ? this.events : this.events.filter(e=>e.type===this.filtre); }
}
