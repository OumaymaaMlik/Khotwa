export type EvenementType = 'formation' | 'pitch' | 'webinar' | 'coaching';

export interface Evenement {
  id: string;
  titre: string;
  type: EvenementType;
  date: Date;
  heure: string;
  intervenant: string;
  lienMeet?: string;
  description: string;
  placesTotal: number;
  placesRestantes: number;
  inscrits: string[];
  listeAttente: string[];
}
