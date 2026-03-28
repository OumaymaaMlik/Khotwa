import { Component } from '@angular/core';

@Component({
  selector: 'app-coach-talent',
  templateUrl: './talent.component.html',
  styleUrls: ['./talent.component.css']
})
export class CoachTalentComponent {
  view = 'talents';

  talents = [
    { id: 't1', nom: 'Karim Dridi',       poste: 'Full Stack Developer',  competences: ['Angular', 'Node.js', 'MongoDB'],    score: 92, disponible: true  },
    { id: 't2', nom: 'Amira Saidi',        poste: 'UX/UI Designer',        competences: ['Figma', 'Adobe XD', 'CSS'],          score: 88, disponible: true  },
    { id: 't3', nom: 'Youssef Ben Hmida',  poste: 'Data Scientist',         competences: ['Python', 'TensorFlow', 'SQL'],        score: 75, disponible: false },
    { id: 't4', nom: 'Sonia Mhiri',        poste: 'Digital Marketing',      competences: ['SEO', 'Google Ads', 'Analytics'],     score: 81, disponible: true  },
  ];

  annonces = [
    { id: 'a1', startup: 'EduTech Pro',   poste: 'Co-founder CTO',    type: 'cofondateur', competences: ['React', 'AWS'],    match: 92 },
    { id: 'a2', startup: 'HealthMobile',  poste: 'iOS Dev Intern',     type: 'stagiaire',   competences: ['Swift', 'UIKit'], match: 75 },
  ];

  showForm = false;
  newAnnonce = { poste: '', startup: '', type: 'stagiaire', competences: '' };

  submitAnnonce() {
    if (!this.newAnnonce.poste || !this.newAnnonce.startup) return;
    this.annonces.push({
      id: 'a' + Date.now(),
      startup: this.newAnnonce.startup,
      poste: this.newAnnonce.poste,
      type: this.newAnnonce.type,
      competences: this.newAnnonce.competences.split(',').map(s => s.trim()).filter(Boolean),
      match: 0,
    });
    this.showForm = false;
    this.newAnnonce = { poste: '', startup: '', type: 'stagiaire', competences: '' };
    this.view = 'annonces';
  }
}
