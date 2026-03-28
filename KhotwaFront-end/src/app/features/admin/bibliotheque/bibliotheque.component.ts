import { Component, OnInit } from '@angular/core';
import { RessourceService, Ressource, AccessLevel, ResourceType, Categorie } from '../../../core/services/ressource.service';

@Component({ selector:'app-admin-bibliotheque', templateUrl:'./bibliotheque.component.html', styleUrls:['./bibliotheque.component.css'] })
export class AdminBibliothequeComponent implements OnInit {
  ressources: Ressource[] = [];
  categories: Categorie[] = [];
  filterType: string = 'ALL';
  filterAccess: string = 'ALL';
  filterPublie: string = 'ALL';
  search: string = '';

  showForm: boolean = false;
  isEditing: boolean = false;
  editId: number | null = null;
  showDeleteConfirm: boolean = false;
  deleteTarget: Ressource | null = null;

  form: any = this.emptyForm();
  selectedFile: File | null = null;

  typeIcons: Record<string, string> = { PDF:'📄', VIDEO:'🎥', EXCEL:'📊', WORD:'📝', IMAGE:'🖼️', LINK:'🔗' };
  types: ResourceType[] = ['PDF','VIDEO','EXCEL','WORD','IMAGE','LINK'];
  accessLevels: AccessLevel[] = ['PUBLIC','INCUBES','PAYANT'];

  constructor(public ressourceService: RessourceService) {}

  ngOnInit() { this.load(); this.categories = this.ressourceService.getCategories(); }

  emptyForm() {
    return { titre:'', description:'', type:'PDF' as ResourceType, niveauAcces:'PUBLIC' as AccessLevel,
             categorieId: null as number|null, tags:'', dureeSec: null as number|null,
             nombrePages: null as number|null, publie: false, urlExterne:'' };
  }

  load() {
    let filters: any = { type: this.filterType, access: this.filterAccess, search: this.search };
    if (this.filterPublie === 'published') filters.publie = true;
    if (this.filterPublie === 'draft') filters.publie = false;
    this.ressources = this.ressourceService.getRessources(filters);
  }

  onSearch() { this.load(); }

  openCreate() {
    this.form = this.emptyForm();
    this.isEditing = false;
    this.editId = null;
    this.selectedFile = null;
    this.showForm = true;
  }

  openEdit(r: Ressource) {
    this.form = {
      titre: r.titre, description: r.description, type: r.type, niveauAcces: r.niveauAcces,
      categorieId: r.categorie?.id || null, tags: r.tags?.map(t => t.nom).join(', ') || '',
      dureeSec: r.dureeSec || null, nombrePages: r.nombrePages || null,
      publie: r.publie, urlExterne: r.urlExterne || ''
    };
    this.isEditing = true;
    this.editId = r.id;
    this.selectedFile = null;
    this.showForm = true;
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  submitForm() {
    if (!this.form.titre || !this.form.type || !this.form.niveauAcces) return;
    const categorie = this.categories.find(c => c.id === +this.form.categorieId!) || null;
    const tags = this.form.tags ? this.form.tags.split(',').map((t: string) => ({ id: Date.now(), nom: t.trim() })).filter((t: any) => t.nom) : [];
    const taille = this.selectedFile ? this.selectedFile.size : 0;
    const tailleFormatee = taille < 1024 ? taille + ' B' : taille < 1048576 ? (taille/1024).toFixed(1) + ' KB' : (taille/1048576).toFixed(1) + ' MB';

    const data: Partial<Ressource> = {
      titre: this.form.titre, description: this.form.description, type: this.form.type,
      niveauAcces: this.form.niveauAcces, categorie, tags, publie: this.form.publie,
      dureeSec: this.form.dureeSec || 0, nombrePages: this.form.nombrePages || 0,
      urlExterne: this.form.urlExterne,
      nomFichierOriginal: this.selectedFile?.name || '',
      tailleFichierOctets: taille, tailleFormatee,
      urlFichier: this.form.type === 'LINK' ? this.form.urlExterne : '/khotwa/api/ressources/new/download',
    };

    if (this.isEditing && this.editId) {
      this.ressourceService.updateRessource(this.editId, data);
    } else {
      this.ressourceService.addRessource(data);
    }
    this.showForm = false;
    this.load();
  }

  confirmDelete(r: Ressource) { this.deleteTarget = r; this.showDeleteConfirm = true; }
  doDelete() {
    if (this.deleteTarget) { this.ressourceService.deleteRessource(this.deleteTarget.id); this.load(); }
    this.showDeleteConfirm = false; this.deleteTarget = null;
  }
  cancelDelete() { this.showDeleteConfirm = false; this.deleteTarget = null; }

  togglePublie(r: Ressource) { this.ressourceService.togglePublie(r.id); this.load(); }

  getAccessBadge(access: string): string {
    return access === 'PUBLIC' ? 'kh-badge--green' : access === 'PAYANT' ? 'kh-badge--amber' : 'kh-badge--teal';
  }

  get stats() { return this.ressourceService.getStats(); }
}
