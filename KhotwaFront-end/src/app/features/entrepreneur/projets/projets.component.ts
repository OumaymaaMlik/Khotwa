import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CreateProjetPayload, CreateProjetTaskPayload, ProjetService } from '../../../core/services/projet.service';
@Component({ selector:'app-entrepreneur-projets', templateUrl:'./projets.component.html', styleUrls:['./projets.component.css'] })
export class EntrepreneurProjetsComponent implements OnInit {
  filtre = 'tous';

  showCreateForm = false;
  isSubmitting = false;
  loadingProjects = false;
  createError = '';
  createSuccess = '';

  createForm: CreateProjetPayload = {
    nom: '',
    description: '',
    statut: 'in_progress',
    tachesInitiales: [this.newEmptyTask()],
  };

  constructor(public projetService: ProjetService, private authService: AuthService) {}

  ngOnInit(): void {
    this.refreshProjects();
  }

  get filteredProjets() {
    const l = this.projetService.projets;
    return this.filtre === 'tous' ? l : l.filter(p => p.statut === this.filtre);
  }

  refreshProjects(): void {
    this.loadingProjects = true;
    this.projetService.loadProjets().subscribe({
      next: () => {
        this.loadingProjects = false;
      },
      error: () => {
        this.loadingProjects = false;
      },
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.createError = '';
    this.createSuccess = '';
  }

  addTask(): void {
    this.createForm.tachesInitiales.push(this.newEmptyTask());
  }

  removeTask(index: number): void {
    if (this.createForm.tachesInitiales.length <= 1) return;
    this.createForm.tachesInitiales.splice(index, 1);
  }

  submitCreateProject(): void {
    this.createError = '';
    this.createSuccess = '';

    const validationMessage = this.validateCreateForm();
    if (validationMessage) {
      this.createError = validationMessage;
      return;
    }

    this.isSubmitting = true;
    const entrepreneurId = this.authService.currentUser?.id ?? 'u2';

    this.projetService.createProject(this.createForm, entrepreneurId).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.createSuccess = 'Project created successfully.';
        this.resetCreateForm();
        this.showCreateForm = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.isSubmitting = false;
        this.createError = err.error?.message ?? 'Unable to create project. Please try again.';
      },
    });
  }

  getStatusLabel(statut: 'in_progress' | 'completed' | 'suspended'): string {
    if (statut === 'completed') return 'Completed';
    if (statut === 'suspended') return 'Suspended';
    return 'In progress';
  }

  trackByTaskIndex(index: number): number {
    return index;
  }

  private newEmptyTask(): CreateProjetTaskPayload {
    return {
      titre: '',
      description: '',
      priorite: 'MOYENNE',
      statut: 'A_FAIRE',
      dateLimite: '',
    };
  }

  private validateCreateForm(): string {
    const nom = this.createForm.nom.trim();
    if (!nom) return 'Project name is required.';
    if (!this.createForm.tachesInitiales.length) return 'At least one initial task is required.';

    const invalidTask = this.createForm.tachesInitiales.find(task => !task.titre.trim());
    if (invalidTask) return 'Each task must have a title.';

    return '';
  }

  private resetCreateForm(): void {
    this.createForm = {
      nom: '',
      description: '',
      statut: 'in_progress',
      tachesInitiales: [this.newEmptyTask()],
    };
  }
}
