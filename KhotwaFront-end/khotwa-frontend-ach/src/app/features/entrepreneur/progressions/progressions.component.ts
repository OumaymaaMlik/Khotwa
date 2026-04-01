import { Component, OnInit } from '@angular/core';
import { RessourceService, Ressource } from '../../../core/services/ressource.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-entrepreneur-progressions',
  templateUrl: './progressions.component.html',
  styleUrls: ['./progressions.component.css']
})
export class EntrepreneurProgressionsComponent implements OnInit {

  progressions: any[] = [];
  loading = false;

  userId   = 2;
  userRole = 'ENTREPRENEUR';

  typeIcons: Record<string, string> = {
    PDF: '📄', VIDEO: '🎥', EXCEL: '📊', WORD: '📝', IMAGE: '🖼️', LINK: '🔗'
  };

  constructor(private svc: RessourceService, private router: Router) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getMesProgressionsHttp(this.userId).subscribe({
      next: res => {
        this.progressions = (res.data ?? []).sort((a: any, b: any) => {
          // Tri : en cours en premier, complétés en dernier
          const order: any = { IN_PROGRESS: 0, NOT_STARTED: 1, COMPLETED: 2 };
          return (order[a.statut] ?? 1) - (order[b.statut] ?? 1);
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get enCours()   { return this.progressions.filter(p => p.statut === 'IN_PROGRESS'); }
  get complets()  { return this.progressions.filter(p => p.statut === 'COMPLETED'); }
  get nonDemarre(){ return this.progressions.filter(p => p.statut === 'NOT_STARTED'); }

  getProgressColor(s: string): string {
    return s === 'COMPLETED' ? 'var(--green)' : s === 'IN_PROGRESS' ? 'var(--teal)' : 'var(--text-muted)';
  }

  openBibliotheque() { this.router.navigateByUrl('/entrepreneur/bibliotheque'); }

  marquerTermine(p: any) {
    this.svc.marquerTermineHttp(this.userId, p.ressource.id).subscribe({
      next: () => this.load()
    });
  }
}
