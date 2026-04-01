import { Component } from '@angular/core';
import { ProjetService } from '../../../core/services/projet.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector:'app-coach-planning', templateUrl:'./planning.component.html', styleUrls:['./planning.component.css'] })
export class CoachPlanningComponent {
  constructor(public projetService: ProjetService, public auth: AuthService) {}
  get projets() { return this.projetService.projets; }
  filtre = 'tous';
  search = '';
  selectedConv: any = null;
  newMsg = '';
  today = new Date();
  currentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();
  monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  dayNames = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  calEvents = [
    {id:'e1',titre:'Pitch Day',date:5,type:'evenement',couleur:'#E8622A'},
    {id:'e2',titre:'Livraison MVP',date:12,type:'deadline',couleur:'#E84A4A'},
    {id:'e3',titre:'Sprint Review',date:15,type:'rdv',couleur:'#2ABFBF'},
    {id:'e7',titre:'Onboarding',date:this.today.getDate(),type:'rdv',couleur:'#2ABFBF'},
  ];
  get calCells() {
    const yr=this.currentYear,mo=this.currentMonth;
    const firstDay=new Date(yr,mo,1).getDay();
    const offset=firstDay===0?6:firstDay-1;
    const daysInMonth=new Date(yr,mo+1,0).getDate();
    const cells:any[]=[];
    for(let i=0;i<offset;i++) cells.push({day:null,events:[]});
    for(let d=1;d<=daysInMonth;d++) cells.push({day:d,events:this.calEvents.filter(e=>e.date===d)});
    while(cells.length<42) cells.push({day:null,events:[]});
    return cells;
  }
  isToday(day:number|null){return day===this.today.getDate()&&this.currentMonth===this.today.getMonth()&&this.currentYear===this.today.getFullYear();}
  prevMonth(){if(this.currentMonth===0){this.currentMonth=11;this.currentYear--;}else{this.currentMonth--;}}
  nextMonth(){if(this.currentMonth===11){this.currentMonth=0;this.currentYear++;}else{this.currentMonth++;}}
  conversations=[
    {id:'c1',nom:'Sara Trabelsi',initials:'ST',color:'#2ABFBF',lastMsg:'Hello!',time:'11:24',unread:2,messages:[{from:'Sara',text:'Hello! Update done',time:'11:20',mine:false}]},
    {id:'c2',nom:'Ahmed Coach',initials:'AC',color:'#7C5CBF',lastMsg:'Session confirmée',time:'10:15',unread:0,messages:[{from:'Ahmed',text:'Session vendredi 14h',time:'10:15',mine:false}]},
  ];
  selectConv(c:any){this.selectedConv={...c,unread:0};c.unread=0;}
  sendMsg(){if(!this.newMsg.trim()||!this.selectedConv)return;this.selectedConv.messages.push({from:'Moi',text:this.newMsg,time:'maintenant',mine:true});this.newMsg='';}
  onMsgKey(e:KeyboardEvent){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();this.sendMsg();}}
  workflows=[
    {id:'w1',nom:'Validation par Preuve',desc:'Vérifie que le document requis est présent',trigger:'À la soumission',statut:'actif',etapes:['Soumission tâche','Vérif. document','Notification coach','Validation'],runs:34,icone:'✅',color:'#27AE7A'},
    {id:'w2',nom:'Alerte SLA',desc:'Notification si blocage > 15 jours',trigger:'Cron quotidien',statut:'actif',etapes:['Scan BDD','Calcul délai','SLA > 15j?','Notification'],runs:87,icone:'⏰',color:'#E8622A'},
    {id:'w3',nom:'Propagation Retard',desc:'Recalcule les dates en cas de retard critical',trigger:'Mise à jour tâche',statut:'actif',etapes:['Détection retard','Impact?','Recalcul dates','Notif équipe'],runs:12,icone:'📅',color:'#2ABFBF'},
    {id:'w4',nom:'Alerte Deadline 24h',desc:'Push notification avant deadline',trigger:'Cron toutes 6h',statut:'actif',etapes:['Scan deadlines','< 24h?','Email + Push','Log'],runs:156,icone:'🔔',color:'#F5A623'},
  ];
  ressources=[
    {id:'r1',titre:'Business Plan Guide',desc:'Modèle complet',type:'pdf',acces:'incubes',categorie:'Strategy',taille:'2.4 MB',progression:100,lu:true},
    {id:'r2',titre:'Template Canvas BMC',desc:'Excel interactif',type:'xlsx',acces:'public',categorie:'Outils',taille:'850 KB',progression:0,lu:false},
    {id:'r3',titre:'Pitch Masterclass',desc:'Vidéo 45min',type:'video',acces:'payant',categorie:'Training',taille:'45 min',progression:60,lu:false},
    {id:'r4',titre:'SARL Legal Guide',desc:'Étapes légales Tunisie',type:'pdf',acces:'incubes',categorie:'Legal',taille:'1.2 MB',progression:30,lu:false},
  ];
  get filteredRessources(){
    let l=this.ressources;
    if(this.filtre!=='tous')l=l.filter((r:any)=>r.type===this.filtre||r.acces===this.filtre);
    if(this.search)l=l.filter((r:any)=>r.titre.toLowerCase().includes(this.search.toLowerCase()));
    return l;
  }
  validations=[
    {id:'v1',tache:'Prototype UI — E-Learning',startup:'EduTech Pro (Sara)',doc:'maquette_v2.pdf',statut:'en_attente',date:'2024-12-01'},
    {id:'v2',tache:'Tests QA HealthMobile',startup:'HealthMobile (Sara)',doc:'rapport_tests.pdf',statut:'en_attente',date:'2024-12-02'},
    {id:'v3',tache:'Business Plan AgriSmart',startup:'AgriSmart (Sara)',doc:'business_plan_v3.pdf',statut:'valide',date:'2024-11-28'},
  ];
  validate(id:string){const v=this.validations.find(x=>x.id===id);if(v)v.statut='valide';}
  reject(id:string){const v=this.validations.find(x=>x.id===id);if(v)v.statut='rejete';}
}
