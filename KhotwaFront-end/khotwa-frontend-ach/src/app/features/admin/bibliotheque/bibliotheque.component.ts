import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RessourceService, Ressource, AccessLevel, ResourceType, Categorie } from '../../../core/services/ressource.service';

// ── Dossier de cours ─────────────────────────────────────────────
export interface CourseFolder {
  name: string;
  fichiers: Ressource[];
  expanded: boolean;
}

@Component({ selector:'app-admin-bibliotheque', templateUrl:'./bibliotheque.component.html', styleUrls:['./bibliotheque.component.css'] })
export class AdminBibliothequeComponent implements OnInit {

  // Vue : 'table' (ressources individuelles) | 'folders' (dossiers groupés)
  view: 'table' | 'folders' = 'table';

  ressources:    Ressource[] = [];
  folders:       CourseFolder[] = [];
  categories:    Categorie[] = [];
  loading = false;
  error   = '';

  filterType         = 'ALL';
  filterAccess       = 'ALL';
  filterPublie       = 'ALL';
  filterCategorieId: number | null = null;
  search = '';

  showForm          = false;
  isEditing         = false;
  editId: number | null = null;
  showDeleteConfirm = false;
  deleteTarget: Ressource | null = null;

  form: any = this.emptyForm();
  selectedFiles: File[] = [];
  courseName = '';

  // ── Catégories CRUD ──────────────────────────────────────────────
  showCatPanel   = false;
  catForm: any   = { nom: '', description: '', couleur: '#E8622A', icone: '📁' };
  editingCatId: number | null = null;

  typeIcons: Record<string,string> = { PDF:'📄', VIDEO:'🎥', EXCEL:'📊', WORD:'📝', IMAGE:'🖼️', LINK:'🔗' };
  types: ResourceType[] = ['PDF','VIDEO','EXCEL','WORD','IMAGE','LINK'];
  accessLevels: AccessLevel[] = ['PUBLIC','INCUBES','PAYANT'];
  statsData: any = {};

  constructor(public ressourceService: RessourceService) {}

  ngOnInit() { this.loadCategories(); this.loadStats(); this.load(); }

  emptyForm() {
    return { titre:'', description:'', type:'PDF' as ResourceType,
             niveauAcces:'PUBLIC' as AccessLevel, categorieId: null as number|null,
             tags:'', dureeSec: null as number|null, nombrePages: null as number|null,
             publie: true, urlExterne:'' };
  }

  // ── Chargement + enrichissement ──────────────────────────────────
  load() {
    this.loading = true; this.error = '';
    const filters: any = { type: this.filterType, access: this.filterAccess, search: this.search };
    if (this.filterCategorieId) filters.categorieId = this.filterCategorieId;

    this.ressourceService.getRessourcesHttp(filters).subscribe({
      next: res => {
        const list: Ressource[] = res.data ?? res;
        const detailCalls = list.map(r =>
          this.ressourceService.getRessourceByIdHttp(r.id, 1, 'ADMIN').pipe(catchError(() => of(null)))
        );
        if (detailCalls.length === 0) { this.ressources = []; this.folders = []; this.loading = false; return; }
        forkJoin(detailCalls).subscribe({
          next: (details: any[]) => {
            this.ressources = list.map((r, i) => {
              const d    = details[i]?.data?.ressource ?? details[i]?.data ?? null;
              const tags = details[i]?.data?.tags ?? d?.tags ?? r.tags ?? [];
              const prog = details[i]?.data?.maProgression ?? d?.maProgression ?? r.maProgression;
              return { ...r, tags, maProgression: prog };
            });
            this.buildFolders();
            this.loading = false;
          },
          error: () => { this.ressources = list; this.buildFolders(); this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Construction des dossiers ────────────────────────────────────
  // Regroupe les ressources dont le titre contient " — "
  // Exemple : "Cours JS — chapitre1.pdf" → dossier "Cours JS"
  buildFolders() {
    const map = new Map<string, Ressource[]>();
    const solo: Ressource[] = [];

    this.ressources.forEach(r => {
      const sep = r.titre.indexOf(' — ');
      if (sep > -1) {
        const key = r.titre.substring(0, sep).trim();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(r);
      } else {
        solo.push(r);
      }
    });

    // Dossiers (plusieurs fichiers) + ressources solo
    this.folders = [];
    map.forEach((fichiers, name) => {
      if (fichiers.length > 1) {
        this.folders.push({ name, fichiers, expanded: false });
      } else {
        solo.push(...fichiers); // 1 seul fichier → pas de dossier
      }
    });

    // Les ressources solo apparaissent comme dossier virtuel "Files"
    if (solo.length > 0) {
      this.folders.push({ name: '__solo__', fichiers: solo, expanded: true });
    }
  }

  toggleFolder(f: CourseFolder) { f.expanded = !f.expanded; }

  onSearch() { this.load(); }

  openCreate() {
    this.form = this.emptyForm(); this.isEditing = false;
    this.editId = null; this.selectedFiles = []; this.courseName = ''; this.showForm = true;
  }

  openEdit(r: Ressource) {
    this.form = {
      titre: r.titre, description: r.description, type: r.type, niveauAcces: r.niveauAcces,
      categorieId: r.categorie?.id || null,
      tags: r.tags?.map((t:any) => t.nom).join(', ') || '',
      dureeSec: r.dureeSec || null, nombrePages: r.nombrePages || null,
      publie: r.publie, urlExterne: (r as any).urlExterne || ''
    };
    this.isEditing = true; this.editId = r.id;
    this.selectedFiles = []; this.showForm = true;
  }

  onTypeChange() {
    // Clear selected files when resource type changes
    this.selectedFiles = [];
    this.courseName = '';
  }

  onFileChange(e: any) {
    const newFiles = Array.from(e.target.files as FileList) as File[];
    // Accumulate files — adding to existing selection rather than replacing
    const existing = this.selectedFiles.map(f => f.name);
    const toAdd = newFiles.filter(f => !existing.includes(f.name));
    this.selectedFiles = [...this.selectedFiles, ...toAdd];
    // Reset the input so the same file can be re-selected if removed
    e.target.value = '';
  }

  removeFile(i: number) { this.selectedFiles.splice(i, 1); }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1048576).toFixed(1) + ' MB';
  }

  // ── Soumission du formulaire ─────────────────────────────────────
  submitForm() {
    if (!this.form.titre) return;

    if (this.isEditing && this.editId) {
      const body: any = {
        titre: this.form.titre, description: this.form.description,
        niveauAcces: this.form.niveauAcces, publie: this.form.publie,
        urlExterne: this.form.urlExterne
      };
      if (this.form.categorieId) body.categorieId = this.form.categorieId;
      if (this.form.tags) body.tags = this.form.tags.split(',').map((t:any) => t.trim()).filter(Boolean);
      if (this.form.dureeSec)    body.dureeSec    = this.form.dureeSec;
      if (this.form.nombrePages) body.nombrePages = this.form.nombrePages;
      this.ressourceService.updateRessourceHttp(this.editId, body).subscribe({
        next: () => { this.showForm = false; this.load(); this.loadStats(); },
        error: err => alert('Error: ' + (err.error?.message || 'Server error'))
      });
      return;
    }

    // ── Création : fichier unique ou dossier de cours ────────────
    const files = this.selectedFiles.length > 0 ? this.selectedFiles : [null as any];
    const isMulti   = this.selectedFiles.length > 1;
    const courseTitle = isMulti && this.courseName.trim() ? this.courseName.trim() : this.form.titre;

    let completed = 0;
    const total = files.length;

    for (const file of files) {
      const fd = this.ressourceService.buildFormData(this.form, file);
      if (isMulti && file) {
        const fileLabel = file.name.replace(/\.[^/.]+$/, '');
        fd.set('titre',       courseTitle + ' — ' + fileLabel);
        fd.set('description', this.form.description || ('Part of: ' + courseTitle));
      }
      this.ressourceService.createRessourceHttp(fd, 1).subscribe({
        next: () => { completed++; if (completed === total) { this.showForm = false; this.courseName = ''; this.load(); this.loadStats(); } },
        error: err => alert('Error: ' + (err.error?.message || 'Server error'))
      });
    }
  }

  confirmDelete(r: Ressource) { this.deleteTarget = r; this.showDeleteConfirm = true; }
  doDelete() {
    if (!this.deleteTarget) return;
    this.ressourceService.deleteRessourceHttp(this.deleteTarget.id).subscribe({
      next: () => { this.load(); this.loadStats(); },
      error: err => alert('Error: ' + (err.error?.message || 'Server error'))
    });
    this.showDeleteConfirm = false; this.deleteTarget = null;
  }
  cancelDelete() { this.showDeleteConfirm = false; this.deleteTarget = null; }

  togglePublie(r: Ressource) {
    this.ressourceService.togglePublieHttp(r.id).subscribe({ next: () => this.load() });
  }

  downloadRessource(r: any) {
    const url = r.urlFichier?.startsWith('http') ? r.urlFichier
              : r.urlFichier ? 'http://localhost:8084' + r.urlFichier
              : r.urlExterne ?? '';
    if (!url) { alert('No file attached.'); return; }
    fetch(url, { headers: { 'X-User-Id': '1', 'X-User-Role': 'ADMIN' } })
      .then(res => res.blob())
      .then(blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = r.nomFichierOriginal || r.titre; a.click(); URL.revokeObjectURL(a.href); })
      .catch(() => window.open(url, '_blank'));
  }

  // ── Stats & categories ───────────────────────────────────────────
  loadStats() { this.ressourceService.getStatsHttp(1).subscribe({ next: r => this.statsData = r.data ?? {}, error: () => {} }); }
  get stats() { return this.statsData; }

  loadCategories() {
  this.ressourceService.getCategoriesHttp().subscribe({
    next: (res) => {
      // On utilise les données de l'API, ou un tableau vide si rien n'est reçu
      this.categories = res.data ?? [];
    },
    error: (err) => {
      console.error('Erreur lors du chargement des catégories', err);
      this.categories = []; // En cas d'erreur, on initialise à vide
      this.error = "Impossible de charger les catégories.";
    }
  });
}

  // ── CRUD Catégories ──────────────────────────────────────────────
  openCatPanel() { this.showCatPanel = true; this.catForm = { nom:'', description:'', couleur:'#E8622A', icone:'📁' }; this.editingCatId = null; }
  closeCatPanel() { this.showCatPanel = false; }

  editCategorie(c: Categorie) {
    this.editingCatId = c.id;
    this.catForm = { nom: c.nom, description: c.description || '', couleur: c.couleur || '#E8622A', icone: c.icone || '📁' };
  }

  submitCategorie() {
    if (!this.catForm.nom) return;
    if (this.editingCatId) {
      this.ressourceService.updateCategorieHttp(this.editingCatId, this.catForm).subscribe({
        next: () => { this.editingCatId = null; this.catForm = { nom:'', description:'', couleur:'#E8622A', icone:'📁' }; this.loadCategories(); },
        error: () => this.loadCategories()
      });
    } else {
      this.ressourceService.createCategorieHttp(this.catForm).subscribe({
        next: () => { this.catForm = { nom:'', description:'', couleur:'#E8622A', icone:'📁' }; this.loadCategories(); },
        error: () => this.loadCategories()
      });
    }
  }

  deleteCategorie(c: Categorie) {
    if (!confirm(`Delete category "${c.nom}"?`)) return;
    this.ressourceService.deleteCategorieHttp(c.id).subscribe({
      next: () => this.loadCategories(), error: () => this.loadCategories()
    });
  }

  getAccessBadge(a: string): string {
    return a === 'PUBLIC' ? 'kh-badge--green' : a === 'PAYANT' ? 'kh-badge--amber' : 'kh-badge--teal';
  }

  getProgressColor(s: string): string {
    return s === 'COMPLETED' ? 'var(--green)' : s === 'IN_PROGRESS' ? 'var(--teal)' : 'var(--text-muted)';
  }
}
