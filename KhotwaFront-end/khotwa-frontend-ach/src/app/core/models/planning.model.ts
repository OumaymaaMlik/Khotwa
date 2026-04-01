export type SlotStatut = 'libre' | 'reserve' | 'annule';

export interface Slot {
  id: string;
  coachId: string;
  coachNom: string;
  date: Date;
  heureDebut: string;
  heureFin: string;
  statut: SlotStatut;
  entrepreneurId?: string;
}

export interface Deadline {
  id: string;
  titre: string;
  projetId: string;
  date: Date;
  type: 'livrable' | 'etape' | 'rdv';
  alerte24h: boolean;
}

export interface CalendrierEvent {
  id: string;
  titre: string;
  date: Date;
  type: 'deadline' | 'slot' | 'evenement';
  couleur: string;
  ref?: string;
}
