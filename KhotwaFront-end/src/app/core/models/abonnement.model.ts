export type PlanType = 'gratuit' | 'premium' | 'institutionnel';
export type AbonnementStatut = 'actif' | 'expire' | 'suspended';

export interface Abonnement {
  id: string;
  userId: string;
  plan: PlanType;
  statut: AbonnementStatut;
  dateDebut: Date;
  dateFin: Date;
  autoRenouvellement: boolean;
}
