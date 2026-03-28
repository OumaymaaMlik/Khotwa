export type RessourceAcces = 'public' | 'incubes' | 'payant';
export type RessourceType = 'pdf' | 'video' | 'xlsx' | 'template';

export interface Ressource {
  id: string;
  titre: string;
  description: string;
  type: RessourceType;
  acces: RessourceAcces;
  categorie: string;
  tags: string[];
  url: string;
  taille?: string;
  dureeMin?: number;
  progression?: number;
  lu: boolean;
}
