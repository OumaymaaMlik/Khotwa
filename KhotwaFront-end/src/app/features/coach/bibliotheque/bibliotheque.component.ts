import { Component, OnInit } from '@angular/core';
import { RessourceService, Ressource } from '../../../core/services/ressource.service';

@Component({ selector:'app-coach-bibliotheque', templateUrl:'./bibliotheque.component.html', styleUrls:['./bibliotheque.component.css'] })
export class CoachBibliothequeComponent implements OnInit {
  ressources: Ressource[] = [];
  categories: any[] = [];
  filterType: string = 'ALL';
  filterAccess: string = 'ALL';
  search: string = '';
  selectedRessource: Ressource | null = null;
  showDetail: boolean = false;
  typeIcons: Record<string, string> = { PDF:'📄', VIDEO:'🎥', EXCEL:'📊', WORD:'📝', IMAGE:'🖼️', LINK:'🔗' };

  constructor(public ressourceService: RessourceService) {}
  ngOnInit() { this.load(); this.categories = this.ressourceService.getCategories(); }
  load() { this.ressources = this.ressourceService.getRessources({ type: this.filterType, access: this.filterAccess, search: this.search, publie: true }); }
  onSearch() { this.load(); }
  openDetail(r: Ressource) { this.selectedRessource = r; this.showDetail = true; }
  closeDetail() { this.showDetail = false; this.selectedRessource = null; }
  markComplete(r: Ressource) { this.ressourceService.updateProgression(r.id, 'COMPLETED', 100); this.load(); }
  getProgressColor(status: string): string { return status === 'COMPLETED' ? 'var(--green)' : status === 'IN_PROGRESS' ? 'var(--teal)' : 'var(--text-muted)'; }
  getAccessBadge(access: string): string { return access === 'PUBLIC' ? 'kh-badge--green' : access === 'PAYANT' ? 'kh-badge--amber' : 'kh-badge--teal'; }
  get stats() { return this.ressourceService.getStats(); }
}
