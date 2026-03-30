import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { UserRole } from '../core/models';
import { filter } from 'rxjs/operators';

interface NavItem { label: string; icon: string; route: string; roles: UserRole[]; }

@Component({ selector: 'app-layout', templateUrl: './layout.component.html', styleUrls: ['./layout.component.css'] })
export class LayoutComponent implements OnInit {
  sidebarOpen = false;
  notifOpen = false;
  currentUrl = '';

  navItems: NavItem[] = [
    { label: 'Dashboard',    icon: 'dashboard', route: 'dashboard',    roles: ['admin','entrepreneur','coach'] },
    { label: 'Projects',     icon: 'folder',    route: 'projets',      roles: ['admin','entrepreneur','coach'] },
    { label: 'Workflows',    icon: 'workflow',  route: 'workflows',    roles: ['entrepreneur'] },
    { label: 'Planning',     icon: 'calendar',  route: 'planning',     roles: ['admin','entrepreneur','coach'] },
    { label: 'Messages',     icon: 'message',   route: 'messages',     roles: ['admin','entrepreneur','coach'] },
    { label: 'Library',      icon: 'book',      route: 'bibliotheque', roles: ['admin','entrepreneur','coach'] },
    { label: 'My Startups',  icon: 'rocket',    route: 'startups',     roles: ['coach'] },
    { label: 'Validations',  icon: 'check',     route: 'validations',  roles: ['coach'] },
    { label: 'Events',       icon: 'event',     route: 'evenements',   roles: ['admin'] },
    { label: 'Talent Market',icon: 'people',    route: 'talent',       roles: ['admin','entrepreneur','coach'] },
    { label: 'Subscriptions',icon: 'card',      route: 'abonnements',  roles: ['admin'] },
    { label: 'Users',        icon: 'users',     route: 'utilisateurs', roles: ['admin'] },
  ];

  svgIcons: Record<string, string> = {
    dashboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
    folder:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    workflow:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    calendar:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    message:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    book:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    rocket:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    check:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    event:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    people:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    card:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    users:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  };

  constructor(public auth: AuthService, public notifService: NotificationService, private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => { this.currentUrl = e.url; });
    this.currentUrl = this.router.url;
  }

  get visibleNav(): NavItem[] {
    const role = this.auth.currentUser?.role;
    return this.navItems.filter(item => role && item.roles.includes(role));
  }

  get roleLabel(): string {
    const r = this.auth.currentUser?.role;
    return r === 'admin' ? 'Administrator' : r === 'entrepreneur' ? 'Entrepreneur' : r === 'coach' ? 'Coach' : '';
  }

  get roleColor(): string {
    const r = this.auth.currentUser?.role;
    return r === 'admin' ? '#E8622A' : r === 'entrepreneur' ? '#2ABFBF' : '#7C5CBF';
  }

  get rolePrefix(): string {
    const r = this.auth.currentUser?.role;
    return r === 'admin' ? '/khotwaadmin' : r === 'entrepreneur' ? '/entrepreneur' : '/coach';
  }

  getRoute(item: NavItem): string { return `${this.rolePrefix}/${item.route}`; }
  getIcon(name: string): string { return this.svgIcons[name] || ''; }
  isActive(item: NavItem): boolean { return this.currentUrl.includes(`/${item.route}`); }
  switchRole(role: UserRole) { this.auth.login(role); this.router.navigateByUrl(this.auth.getDefaultRoute()); }
  logout() { this.auth.logout(); this.router.navigateByUrl('/'); }
  get nonLus(): number { return Math.min(this.notifService.nonLus(), 99); }
  get notifs() { return this.notifService.latestFive(); }
}
