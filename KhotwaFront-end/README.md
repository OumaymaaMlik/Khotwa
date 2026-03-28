# KHOTWA — Plateforme d'Incubation Multi-Rôles

Architecture **NgModule + Lazy Loading** — Angular 17

## Architecture des Modules

```
AppModule (root)
├── AppRoutingModule          ← Routes racine (lazy load)
│
├── LandingModule             ← / (lazy)
├── AuthModule                ← /login (lazy)
│
├── AdminModule               ← /admin/** (lazy)
│   ├── LayoutModule (importé)
│   ├── AdminDashboardComponent
│   ├── AdminProjetsComponent
│   ├── AdminPlanningComponent
│   ├── AdminMessagesComponent
│   ├── AdminBibliothequeComponent
│   ├── AdminUtilisateursComponent
│   ├── AdminEvenementsComponent
│   ├── AdminAbonnementsComponent
│   └── AdminTalentComponent
│
├── EntrepreneurModule        ← /entrepreneur/** (lazy)
│   ├── LayoutModule (importé)
│   ├── EntrepreneurDashboardComponent
│   ├── EntrepreneurProjetsComponent
│   ├── EntrepreneurWorkflowsComponent
│   ├── EntrepreneurPlanningComponent
│   ├── EntrepreneurMessagesComponent
│   └── EntrepreneurBibliothequeComponent
│
└── CoachModule               ← /coach/** (lazy)
    ├── LayoutModule (importé)
    ├── CoachDashboardComponent
    ├── CoachProjetsComponent
    ├── CoachStartupsComponent
    ├── CoachValidationsComponent
    ├── CoachPlanningComponent
    ├── CoachMessagesComponent
    └── CoachBibliothequeComponent
```

## Lazy Loading

Chaque module est chargé **à la demande** via `loadChildren`:
- `/admin` → `AdminModule` (chargé seulement si on navigue vers /admin)
- `/entrepreneur` → `EntrepreneurModule`
- `/coach` → `CoachModule`
- `/login` → `AuthModule`
- `/` → `LandingModule`

## Routes

| URL | Module | Composant |
|-----|--------|-----------|
| `/` | LandingModule | LandingComponent |
| `/login` | AuthModule | LoginComponent |
| `/admin/dashboard` | AdminModule | AdminDashboardComponent |
| `/admin/projets` | AdminModule | AdminProjetsComponent |
| `/admin/utilisateurs` | AdminModule | AdminUtilisateursComponent |
| `/admin/evenements` | AdminModule | AdminEvenementsComponent |
| `/admin/abonnements` | AdminModule | AdminAbonnementsComponent |
| `/admin/talent` | AdminModule | AdminTalentComponent |
| `/admin/planning` | AdminModule | AdminPlanningComponent |
| `/admin/messages` | AdminModule | AdminMessagesComponent |
| `/admin/bibliotheque` | AdminModule | AdminBibliothequeComponent |
| `/entrepreneur/dashboard` | EntrepreneurModule | EntrepreneurDashboardComponent |
| `/entrepreneur/projets` | EntrepreneurModule | EntrepreneurProjetsComponent |
| `/entrepreneur/workflows` | EntrepreneurModule | EntrepreneurWorkflowsComponent |
| `/entrepreneur/planning` | EntrepreneurModule | EntrepreneurPlanningComponent |
| `/entrepreneur/messages` | EntrepreneurModule | EntrepreneurMessagesComponent |
| `/entrepreneur/bibliotheque` | EntrepreneurModule | EntrepreneurBibliothequeComponent |
| `/coach/dashboard` | CoachModule | CoachDashboardComponent |
| `/coach/projets` | CoachModule | CoachProjetsComponent |
| `/coach/startups` | CoachModule | CoachStartupsComponent |
| `/coach/validations` | CoachModule | CoachValidationsComponent |
| `/coach/planning` | CoachModule | CoachPlanningComponent |
| `/coach/messages` | CoachModule | CoachMessagesComponent |
| `/coach/bibliotheque` | CoachModule | CoachBibliothequeComponent |

## Installation

```bash
npm install
ng serve
```

## Navigation

1. Aller sur `/` → Landing publique
2. Cliquer "Accéder" → `/login` → Choisir son rôle
3. Le module du rôle est chargé lazily

## Changer de rôle (dev)

La sidebar a 3 boutons A/E/C pour switcher de rôle sans passer par login.
