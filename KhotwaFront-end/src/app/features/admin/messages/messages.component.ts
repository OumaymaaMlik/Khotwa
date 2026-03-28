import { Component } from '@angular/core';
import { ProjetService } from '../../../core/services/projet.service';

@Component({ selector:'app-admin-messages', templateUrl:'./messages.component.html', styleUrls:['./messages.component.css'] })
export class AdminMessagesComponent {
  constructor(public projetService: ProjetService) {}
  get projets() { return this.projetService.projets; }
  filtre = 'tous';
  search = '';
  view = 'talents';
  get items() {
    let list = this.projets;
    if (this.filtre !== 'tous') list = list.filter((p:any) => p.statut === this.filtre || p.plan === this.filtre || p.role === this.filtre || p.type === this.filtre);
    if (this.search) list = list.filter((p:any) => JSON.stringify(p).toLowerCase().includes(this.search.toLowerCase()));
    return list;
  }
  users = [
    {id:'u1',nom:'Bensalem',prenom:'Karim',email:'admin@khotwa.tn',role:'admin',statut:'actif',createdAt:'2024-01-01'},
    {id:'u2',nom:'Trabelsi',prenom:'Sara',email:'sara@startup.tn',role:'entrepreneur',statut:'actif',createdAt:'2024-02-15'},
    {id:'u3',nom:'Mansouri',prenom:'Ahmed',email:'ahmed@coach.tn',role:'coach',statut:'actif',createdAt:'2024-03-01'},
    {id:'u4',nom:'Ben Ali',prenom:'Nadia',email:'nadia@edu.tn',role:'entrepreneur',statut:'inactif',createdAt:'2024-04-10'},
  ];
  events = [
    {id:'ev1',titre:'Atelier Pitch Day',type:'pitch',date:'2024-12-10',heure:'14h00',intervenant:'Dr. Ben Salem',places:30,restantes:8},
    {id:'ev2',titre:'Webinar BMC',type:'webinar',date:'2024-12-15',heure:'10h00',intervenant:'Sara Coach',places:50,restantes:0},
    {id:'ev3',titre:'Training Design Thinking',type:'formation',date:'2024-12-20',heure:'09h00',intervenant:'Ahmed Mansouri',places:20,restantes:5},
  ];
  abonnements = [
    {id:'a1',user:'Sara Trabelsi',email:'sara@startup.tn',plan:'premium',statut:'actif',debut:'2024-09-01',fin:'2025-09-01'},
    {id:'a2',user:'Omar Chaabane',email:'omar@agri.tn',plan:'gratuit',statut:'actif',debut:'2024-10-15',fin:'2025-10-15'},
    {id:'a3',user:'Nadia Ben Ali',email:'nadia@edu.tn',plan:'institutionnel',statut:'expire',debut:'2023-11-01',fin:'2024-11-01'},
  ];
  talents = [
    {id:'t1',nom:'Karim Dridi',poste:'Full Stack Developer',competences:['Angular','Node.js'],score:92,disponible:true},
    {id:'t2',nom:'Amira Saidi',poste:'Designer UX/UI',competences:['Figma','CSS'],score:88,disponible:true},
    {id:'t3',nom:'Youssef Ben Hmida',poste:'Data Scientist',competences:['Python','SQL'],score:75,disponible:false},
  ];
  annonces = [
    {id:'a1',startup:'EduTech Pro',poste:'Co-fondateur CTO',type:'cofondateur',competences:['React','AWS'],match:92},
    {id:'a2',startup:'HealthMobile',poste:'Stagiaire iOS Dev',type:'stagiaire',competences:['Swift'],match:75},
  ];
  ressources = [
    {id:'r1',titre:'Business Plan Guide',desc:'Complete business plan template',type:'pdf',acces:'incubes',categorie:'Strategy',taille:'2.4 MB',progression:100,lu:true},
    {id:'r2',titre:'Template Canvas BMC',desc:'Tableau Excel interactif',type:'xlsx',acces:'public',categorie:'Outils',taille:'850 KB',progression:0,lu:false},
    {id:'r3',titre:'Pitch Masterclass',desc:'Video 45min — Dr. Ben Salem',type:'video',acces:'payant',categorie:'Training',taille:'45 min',progression:60,lu:false},
    {id:'r4',titre:'SARL Legal Guide',desc:'Legal steps in Tunisia',type:'pdf',acces:'incubes',categorie:'Legal',taille:'1.2 MB',progression:30,lu:false},
  ];
  get filteredRessources() {
    let l = this.ressources;
    if (this.filtre !== 'tous') l = l.filter((r:any)=>r.type===this.filtre||r.acces===this.filtre);
    if (this.search) l = l.filter((r:any)=>r.titre.toLowerCase().includes(this.search.toLowerCase()));
    return l;
  }
  today = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();
  monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  dayNames = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  calEvents = [
    {id:'e1',titre:'Pitch Day',date:5,type:'evenement',couleur:'#E8622A'},
    {id:'e2',titre:'Livraison MVP',date:12,type:'deadline',couleur:'#E84A4A'},
    {id:'e3',titre:'Sprint Review',date:15,type:'rdv',couleur:'#2ABFBF'},
    {id:'e4',titre:'Demo Client',date:22,type:'rdv',couleur:'#7C5CBF'},
    {id:'e7',titre:'Onboarding',date:this.today.getDate(),type:'rdv',couleur:'#2ABFBF'},
  ];
  get calCells() {
    const yr=this.currentYear, mo=this.currentMonth;
    const firstDay = new Date(yr,mo,1).getDay();
    const offset = firstDay===0?6:firstDay-1;
    const daysInMonth = new Date(yr,mo+1,0).getDate();
    const cells:any[] = [];
    for(let i=0;i<offset;i++) cells.push({day:null,events:[]});
    for(let d=1;d<=daysInMonth;d++) cells.push({day:d,events:this.calEvents.filter(e=>e.date===d)});
    while(cells.length<42) cells.push({day:null,events:[]});
    return cells;
  }
  isToday(day:number|null) { return day===this.today.getDate()&&this.currentMonth===this.today.getMonth()&&this.currentYear===this.today.getFullYear(); }
  prevMonth() { if(this.currentMonth===0){this.currentMonth=11;this.currentYear--;}else{this.currentMonth--;} }
  nextMonth() { if(this.currentMonth===11){this.currentMonth=0;this.currentYear++;}else{this.currentMonth++;} }
  conversations = [
    {id:'c1',nom:'Sara Trabelsi',initials:'ST',color:'#2ABFBF',lastMsg:'Hello, I updated the deliverables',time:'11:24',unread:2,messages:[{from:'Sara',text:'Hello! I updated the sprint deliverables',time:'11:20',mine:false},{from:'Moi',text:"Great, I'll check that",time:'11:22',mine:true}]},
    {id:'c2',nom:'Ahmed Coach',initials:'AC',color:'#7C5CBF',lastMsg:'Coaching session confirmed',time:'10:15',unread:0,messages:[{from:'Ahmed',text:'Coaching session confirmed for Friday 2pm',time:'10:15',mine:false}]},
    {id:'c3',nom:'KHOTWA Team',initials:'KH',color:'#E8622A',lastMsg:'Reminder: webinar tomorrow 10am',time:'09:00',unread:1,messages:[{from:'KHOTWA',text:'Reminder: webinar tomorrow at 10am',time:'09:00',mine:false}]},
  ];
  selectedConv: any = null;
  newMsg = '';
  selectConv(c:any) { this.selectedConv={...c,unread:0}; c.unread=0; }
  sendMsg() {
    if(!this.newMsg.trim()||!this.selectedConv) return;
    this.selectedConv.messages.push({from:'Moi',text:this.newMsg,time:'maintenant',mine:true});
    this.newMsg='';
  }
  onMsgKey(e:KeyboardEvent) { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();this.sendMsg();} }
  delete(id:string) { this.projetService.delete(id); }
}
