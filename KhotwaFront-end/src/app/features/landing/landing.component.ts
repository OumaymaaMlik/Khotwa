import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../../core/models';

@Component({ selector: 'app-landing', templateUrl: './landing.component.html', styleUrls: ['./landing.component.css'] })
export class LandingComponent {
  constructor(private router: Router) {}

  roles = [
    { role: 'entrepreneur' as UserRole, emoji: '🚀', name: 'Future Entrepreneur', color: '#2ABFBF',
      desc: 'Manage your startup, track your incubation journey and collaborate with your coach.',
      features: ['Project management', 'Smart workflows', 'SLA tracking', 'Planning & deadlines', 'Resource library'] },
    { role: 'coach' as UserRole, emoji: '🎯', name: 'Coach / Mentor', color: '#7C5CBF',
      desc: 'Support your startups, validate deliverables and organise your coaching sessions.',
      features: ['Startup tracking', 'Proof-based validation', 'Coaching sessions', 'Direct messaging', 'Personal calendar'] },
  ];

  features = [
    { icon: '📁', title: 'Project Management', desc: 'Steps, tasks, deliverables and real-time progress tracking with integrated Gantt view.', color: '#E8622A', bg: 'rgba(232,98,42,0.12)' },
    { icon: '⚡', title: 'Smart Workflows', desc: 'SLA automation, 24h deadline alerts and delay propagation — zero configuration.', color: '#2ABFBF', bg: 'rgba(42,191,191,0.12)' },
    { icon: '✅', title: 'Proof-Based Validation', desc: 'Every task validated with an attached document. Full history and traceability.', color: '#27AE7A', bg: 'rgba(39,174,122,0.12)' },
    { icon: '📅', title: 'Planning & Calendar', desc: 'Interactive monthly calendar with coaching slots, deadlines and events.', color: '#7C5CBF', bg: 'rgba(124,92,191,0.12)' },
    { icon: '📚', title: 'Resource Library', desc: 'Videos, templates, legal guides — filtered by access level and progress tracking.', color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
    { icon: '💬', title: 'Integrated Messaging', desc: 'Direct communication between all stakeholders with history and attachments.', color: '#E84A4A', bg: 'rgba(232,74,74,0.12)' },
  ];

  steps = [
    { n: '1', cls: 's1', title: 'Sign up', desc: 'Choose your role and access your personalised space in seconds.' },
    { n: '2', cls: 's2', title: 'Create your project', desc: 'Define your steps, deliverables and plan your incubation roadmap.' },
    { n: '3', cls: 's3', title: 'Collaborate', desc: 'Work with your coach, validate tasks and track your SLA progress.' },
    { n: '4', cls: 's4', title: 'Get certified', desc: 'Complete all steps and earn your official KHOTWA certification.' },
  ];

  navItems = [
    { label: 'Features', anchor: '#fonctionnalites' },
    { label: 'Roles', anchor: '#roles' },
    { label: 'How it works', anchor: '#processus' },
    { label: 'Pricing', anchor: '#pricing' },
    { label: 'Contact', anchor: '#contact' },
  ];

  partnerLogos = ['EduTech Pro', 'AgriSmart', 'HealthMobile', 'BTP Connect', 'StartupLab'];


  plans = [
    {
      name: 'Starter', icon: '🌱', color: '#2ABFBF', price: 'Free', period: '',
      desc: 'Perfect for individuals exploring the platform.',
      badge: '', featured: false, cta: 'Get started free',
      features: ['1 active project', 'Basic workflows', 'Coach access', 'Resource library', 'Email support'],
    },
    {
      name: 'Growth', icon: '🚀', color: '#E8622A', price: '$29', period: '/ month',
      desc: 'For entrepreneurs serious about their startup journey.',
      badge: 'Most popular', featured: true, cta: 'Start free trial',
      features: ['Up to 5 projects', 'Advanced workflows & SLA', 'Priority coach matching', 'Analytics dashboard', 'File storage 10 GB', 'Priority support'],
    },
    {
      name: 'Incubator', icon: '🏢', color: '#7C5CBF', price: '$99', period: '/ month',
      desc: 'For incubators managing multiple startups at scale.',
      badge: '', featured: false, cta: 'Contact us',
      features: ['Unlimited projects', 'Multi-coach management', 'Custom workflows', 'API access', 'White-label branding', 'Dedicated account manager'],
    },
  ];

  goLogin() { this.router.navigateByUrl('/login'); }
  loginAs(role: UserRole) { this.router.navigateByUrl('/login'); }
}
