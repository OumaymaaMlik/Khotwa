export type MessageStatut = 'en_attente' | 'lu' | 'resolu';

export interface Message {
  id: string;
  expediteurId: string;
  expediteurNom: string;
  destinataireId: string;
  sujet: string;
  contenu: string;
  statut: MessageStatut;
  date: Date;
  archive: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNoms: string[];
  dernierMessage: string;
  dateMessage: Date;
  nonLus: number;
  messages: MessageSimple[];
}

export interface MessageSimple {
  id: string;
  expediteurId: string;
  contenu: string;
  date: Date;
}
