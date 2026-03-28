export type UserRole = 'admin' | 'entrepreneur' | 'coach';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  avatar?: string;
  startup?: string;
}
