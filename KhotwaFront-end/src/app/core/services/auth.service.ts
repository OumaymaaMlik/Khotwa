import { Injectable } from '@angular/core';
import { User, UserRole } from '../models';

const MOCK_USERS: User[] = [
  { id: 'u1', nom: 'Bensalem', prenom: 'Karim', email: 'admin@khotwa.tn', role: 'admin' },
  { id: 'u2', nom: 'Trabelsi', prenom: 'Sara', email: 'sara@startup.tn', role: 'entrepreneur', startup: 'EduTech Pro' },
  { id: 'u3', nom: 'Mansouri', prenom: 'Ahmed', email: 'ahmed@coach.tn', role: 'coach' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser: User | null = MOCK_USERS[0];

  get role(): UserRole | null { return this.currentUser?.role ?? null; }
  get isAdmin(): boolean { return this.currentUser?.role === 'admin'; }
  get isEntrepreneur(): boolean { return this.currentUser?.role === 'entrepreneur'; }
  get isCoach(): boolean { return this.currentUser?.role === 'coach'; }

  login(role: UserRole): void {
    this.currentUser = MOCK_USERS.find(u => u.role === role) ?? null;
  }
  logout(): void { this.currentUser = null; }

  getDefaultRoute(): string {
    const r = this.currentUser?.role;
    return r === 'admin' ? '/khotwaadmin/dashboard'
      : r === 'entrepreneur' ? '/entrepreneur/dashboard'
      : r === 'coach' ? '/coach/dashboard' : '/';
  }
}
