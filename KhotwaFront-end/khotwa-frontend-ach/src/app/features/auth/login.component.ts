import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';

@Component({ selector:'app-login', templateUrl:'./login.component.html', styleUrls:['./login.component.css'] })
export class LoginComponent {
  mode: 'signin' | 'signup' = 'signin';

  email = '';
  password = '';
  firstName = '';
  lastName = '';
  selectedRole: UserRole = 'entrepreneur';
  error = '';

  roles = [
    { role: 'entrepreneur' as UserRole, label: 'Entrepreneur', color: '#2ABFBF', icon: '🚀' },
    { role: 'coach' as UserRole, label: 'Coach / Mentor', color: '#7C5CBF', icon: '🎯' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  signIn() {
    this.error = '';
    if (!this.email || !this.password) { this.error = 'Please fill in all fields.'; return; }
    // Mock: find user by email or fall back to role matching
    const mockMap: Record<string, UserRole> = {
      'admin@khotwa.tn': 'admin',
      'sara@startup.tn': 'entrepreneur',
      'ahmed@coach.tn': 'coach',
    };
    const role = mockMap[this.email.toLowerCase()];
    if (!role) { this.error = 'Invalid credentials. Try sara@startup.tn or ahmed@coach.tn.'; return; }
    this.auth.login(role);
    this.router.navigateByUrl(this.auth.getDefaultRoute());
  }

  signUp() {
    this.error = '';
    if (!this.email || !this.password || !this.firstName || !this.lastName) {
      this.error = 'Please fill in all fields.'; return;
    }
    // Mock registration: log in with chosen role
    this.auth.login(this.selectedRole);
    this.router.navigateByUrl(this.auth.getDefaultRoute());
  }
}
