import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RessourceService, Ressource, Categorie, ProgressStatus } from '../../../core/services/ressource.service';
import { forkJoin } from 'rxjs';

declare const pdfjsLib: any;

export interface CourseFolder {
  name: string;
  fichiers: any[];
  expanded: boolean;
}

@Component({
  selector: 'app-coach-bibliotheque',
  templateUrl: './bibliotheque.component.html',
  styleUrls: ['./bibliotheque.component.css']
})
export class CoachBibliothequeComponent implements OnInit, OnDestroy {

  @ViewChild('videoPlayer') videoPlayerRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('pdfCanvas') pdfCanvasRef?: ElementRef<HTMLCanvasElement>;

  ressources: Ressource[] = [];
  folders: CourseFolder[] = [];
  view: 'grid' | 'folders' = 'grid';
  categories: Categorie[] = [];
  loading = false;
  error = '';

  filterType = 'ALL';
  filterAccess = 'ALL';
  filterCategorieId: number | null = null;
  search = '';
  stats: any = {};

  showViewer = false;
  viewerRessource: Ressource | null = null;
  viewerType: 'pdf' | 'video' | 'image' | 'other' = 'other';
  viewerUrl = '';
  rawBlobUrl = '';
  blobUrl: SafeResourceUrl | null = null;
  viewerLoading = false;
  resumeAt = 0;

  pdfDoc: any = null;
  pdfCurrentPage = 1;
  pdfTotalPages = 1;
  pdfRendering = false;
  pdfScale = 1.5;

  private saveInterval: any = null;

  typeIcons: Record<string, string> = {
    PDF: '📄', VIDEO: '🎥', EXCEL: '📊', WORD: '📝', IMAGE: '🖼️', LINK: '🔗'
  };

  userId = 3;
  userRole = 'COACH';
  incube = true;
  premium = true;
  
  private apiBase = this.svc.getApiOrigin();

  constructor(
    private svc: RessourceService,
    private sanitizer: DomSanitizer,
    private zone: NgZone
  ) {}

  ngOnInit() { this.loadCategories(); this.loadStats(); this.load(); }
  ngOnDestroy() { this.stopSaveInterval(); this.revokeBlobUrl(); }

  // ── LOGIQUE D'URL UNIQUE ET NETTOYÉE ──────────────────────────────
  private formatFullUrl(path: string | undefined): string {
    if (!path || path === '#' || path === '') return '';
    if (path.startsWith('http')) return path;

    const base = this.apiBase.replace(/\/+$/, ''); 
    let cleanPath = path;

    // Si le backend renvoie déjà khotwa/api dans le path, on le retire pour éviter le doublon
    if (cleanPath.includes('khotwa/api')) {
        const parts = cleanPath.split('khotwa/api');
        cleanPath = parts[parts.length - 1]; 
    }

    // On s'assure qu'il y a un slash au début
    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }

    const finalUrl = base + cleanPath;
    console.log("Coach URL built:", finalUrl);
    return finalUrl;
  }

  load() {
    this.loading = true; this.error = '';
    const filters: any = { userId: this.userId, role: this.userRole, incube: this.incube, premium: this.premium };
    if (this.filterType !== 'ALL') filters.type = this.filterType;
    if (this.filterAccess !== 'ALL') filters.access = this.filterAccess;
    if (this.filterCategorieId) filters.categorieId = this.filterCategorieId;
    if (this.search) filters.search = this.search;

    forkJoin({
      ressources: this.svc.getRessourcesHttp(filters),
      progressions: this.svc.getMesProgressionsHttp(this.userId)
    }).subscribe({
      next: ({ ressources, progressions }) => {
        const list: Ressource[] = ressources.data ?? ressources;
        const progs: any[] = progressions.data ?? [];
        const pm = new Map<number, any>();
        progs.forEach((p: any) => {
          const rid = p.ressource?.id ?? p.ressourceId;
          if (rid) pm.set(rid, p);
        });
        this.ressources = list.map(r => ({
          ...r,
          maProgression: pm.has(r.id)
            ? { 
                statut: pm.get(r.id).statut, 
                pourcentage: pm.get(r.id).pourcentage,
                positionVideoSec: pm.get(r.id).positionVideoSec,
                currentPage: pm.get(r.id).positionVideoSec 
              }
            : r.maProgression
        }));
        this.buildFolders();
        this.loading = false;
      },
      error: () => { this.error = '⚠️ Impossible de joindre le serveur.'; this.loading = false; }
    });
  }

  loadStats() { this.svc.getStatsHttp(this.userId).subscribe({ next: r => this.stats = r.data ?? {}, error: () => {} }); }
  loadCategories() { this.svc.getCategoriesHttp().subscribe({ next: r => this.categories = r.data ?? [], error: () => {} }); }
  onSearch() { this.load(); }

  openViewer(r: Ressource) {
    this.svc.getRessourceByIdHttp(r.id, this.userId, this.userRole).subscribe({
      next: res => {
        const detail = res.data?.ressource ?? res.data ?? r;
        const tags = res.data?.tags ?? detail.tags ?? r.tags ?? [];
        this.startViewer({ ...r, ...detail, tags, maProgression: r.maProgression ?? detail.maProgression });
      },
      error: () => this.startViewer(r)
    });
  }

  private startViewer(r: Ressource) {
    this.viewerRessource = r;
    this.viewerType = r.type === 'VIDEO' ? 'video' : r.type === 'PDF' ? 'pdf' : r.type === 'IMAGE' ? 'image' : 'other';
    this.resumeAt = (r.maProgression as any)?.positionVideoSec ?? 0;
    this.revokeBlobUrl();
    this.blobUrl = null; this.rawBlobUrl = ''; this.pdfDoc = null;

    if (!r.maProgression || r.maProgression.statut === 'NOT_STARTED') {
      this.svc.updateProgressionHttp(this.userId, r.id, 'IN_PROGRESS', 1).subscribe();
    }

    if (r.type === 'VIDEO') {
      this.viewerUrl = this.formatFullUrl(r.urlFichier || r.urlExterne);
      this.showViewer = true;
      this.startSaveInterval(r);
    } else if (r.type === 'PDF' || r.type === 'IMAGE') {
      this.viewerLoading = true;
      this.showViewer = true;
      this.svc.downloadAsBlob(r.id, this.userId, this.userRole).subscribe({
        next: (blob: Blob) => {
          this.rawBlobUrl = URL.createObjectURL(blob);
          this.viewerLoading = false;
          if (r.type === 'PDF') this.loadPdfJs(this.rawBlobUrl, r);
        },
        error: () => { this.viewerLoading = false; }
      });
    } else {
      this.viewerUrl = this.formatFullUrl(r.urlExterne || r.urlFichier);
      this.showViewer = true;
    }
  }

  private loadPdfJs(blobUrl: string, r: Ressource) {
    if (typeof pdfjsLib === 'undefined') return;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    pdfjsLib.getDocument(blobUrl).promise.then((doc: any) => {
      this.zone.run(() => {
        this.pdfDoc = doc;
        this.pdfTotalPages = doc.numPages;
        const savedPage = (r.maProgression as any)?.positionVideoSec ?? 1;
        this.pdfCurrentPage = Math.max(1, Math.min(savedPage, this.pdfTotalPages));
        setTimeout(() => this.renderPdfPage(this.pdfCurrentPage, r), 100);
      });
    });
  }

  renderPdfPage(pageNum: number, r?: Ressource) {
    if (!this.pdfDoc || this.pdfRendering) return;
    this.pdfRendering = true;
    this.pdfCurrentPage = pageNum;
    this.pdfDoc.getPage(pageNum).then((page: any) => {
      const canvas = this.pdfCanvasRef?.nativeElement;
      if (!canvas) { this.pdfRendering = false; return; }
      const viewport = page.getViewport({ scale: this.pdfScale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const ctx = canvas.getContext('2d');
      page.render({ canvasContext: ctx, viewport }).promise.then(() => {
        this.zone.run(() => {
          this.pdfRendering = false;
          const pct = Math.round((pageNum / this.pdfTotalPages) * 100);
          const statut: ProgressStatus = pct >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
          const target = r ?? this.viewerRessource;
          if (target) {
            if (this.viewerRessource) this.viewerRessource.maProgression = { statut, pourcentage: pct };
            this.svc.saveVideoProgressionHttp(this.userId, target.id, statut, pct, pageNum).subscribe();
          }
        });
      });
    });
  }

  pdfPrevPage() { if (this.pdfCurrentPage > 1) this.renderPdfPage(this.pdfCurrentPage - 1); }
  pdfNextPage() { if (this.pdfCurrentPage < this.pdfTotalPages) this.renderPdfPage(this.pdfCurrentPage + 1); }

  private startSaveInterval(r: Ressource) {
    this.stopSaveInterval();
    this.saveInterval = setInterval(() => {
      const video = this.videoPlayerRef?.nativeElement;
      if (!video || !this.viewerRessource) return;
      const sec = Math.floor(video.currentTime);
      const dur = video.duration || r.dureeSec || 1;
      const pct = Math.min(100, Math.round(sec / dur * 100));
      const statut: ProgressStatus = pct >= 95 ? 'COMPLETED' : 'IN_PROGRESS';
      this.svc.saveVideoProgressionHttp(this.userId, r.id, statut, pct, sec).subscribe();
    }, 10000);
  }

  private stopSaveInterval() { if (this.saveInterval) clearInterval(this.saveInterval); }

  closeViewer() {
    this.stopSaveInterval();
    this.revokeBlobUrl();
    this.showViewer = false;
    this.viewerRessource = null;
    this.pdfDoc = null;
  }

  onVideoLoaded() {
    const video = this.videoPlayerRef?.nativeElement;
    if (video && this.resumeAt > 0) video.currentTime = this.resumeAt;
  }

  private revokeBlobUrl() {
    if (this.rawBlobUrl?.startsWith('blob:')) URL.revokeObjectURL(this.rawBlobUrl);
  }

  downloadRessource(r: Ressource) {
    const url = this.formatFullUrl(r.urlFichier || (r as any).urlExterne);
    if (!url) { alert('Aucun fichier attaché.'); return; }

    fetch(url, { headers: { 'X-User-Id': String(this.userId), 'X-User-Role': this.userRole } })
      .then(res => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (r as any).nomFichierOriginal || r.titre || 'document';
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => window.open(url, '_blank'));
  }

  isCompleted(r: Ressource): boolean { return r.maProgression?.statut === 'COMPLETED'; }
  getProgressColor(s: string): string { return s === 'COMPLETED' ? 'var(--green)' : s === 'IN_PROGRESS' ? 'var(--teal)' : 'var(--text-muted)'; }
  getAccessBadge(a: string): string { return a === 'PUBLIC' ? 'kh-badge--green' : a === 'PAYANT' ? 'kh-badge--amber' : 'kh-badge--teal'; }

  buildFolders() {
    const grouped = new Map<string, Ressource[]>();
    const solo: Ressource[] = [];
    this.ressources.forEach((r) => {
      const sep = r.titre.indexOf(' — ');
      if (sep > -1) {
        const key = r.titre.substring(0, sep).trim();
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(r);
      } else solo.push(r);
    });
    this.folders = [];
    grouped.forEach((fichiers, name) => {
      if (fichiers.length > 1) this.folders.push({ name, fichiers, expanded: false });
      else solo.push(...fichiers);
    });
    if (solo.length > 0) this.folders.push({ name: '__solo__', fichiers: solo, expanded: true });
  }

  toggleFolder(folder: CourseFolder) { folder.expanded = !folder.expanded; }
}