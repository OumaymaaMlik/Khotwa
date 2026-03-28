export interface Competence {
  nom: string;
  niveau: 1 | 2 | 3 | 4 | 5;
}

export interface ProfilTalent {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  competences: Competence[];
  diplome: string;
  disponible: boolean;
  scoreMatch?: number;
}

export interface AnnonceStartup {
  id: string;
  startupNom: string;
  poste: string;
  competencesRequises: Competence[];
  description: string;
  type: 'cofondateur' | 'stagiaire' | 'emploi';
  date: Date;
}
