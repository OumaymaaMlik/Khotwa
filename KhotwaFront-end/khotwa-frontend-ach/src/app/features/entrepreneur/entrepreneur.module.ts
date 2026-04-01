import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule } from '../../layout/layout.module';
import { LayoutComponent } from '../../layout/layout.component';

import { EntrepreneurDashboardComponent }  from './dashboard/dashboard.component';
import { EntrepreneurProjetsComponent }     from './projets/projets.component';
import { EntrepreneurWorkflowsComponent }   from './workflows/workflows.component';
import { EntrepreneurPlanningComponent }    from './planning/planning.component';
import { EntrepreneurMessagesComponent }    from './messages/messages.component';
import { EntrepreneurBibliothequeComponent } from './bibliotheque/bibliotheque.component';
import { EntrepreneurProgressionsComponent } from './progressions/progressions.component';
import { EntrepreneurTalentComponent }       from './talent/talent.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    component: EntrepreneurDashboardComponent },
      { path: 'projets',      component: EntrepreneurProjetsComponent },
      { path: 'workflows',    component: EntrepreneurWorkflowsComponent },
      { path: 'planning',     component: EntrepreneurPlanningComponent },
      { path: 'messages',     component: EntrepreneurMessagesComponent },
      { path: 'bibliotheque', component: EntrepreneurBibliothequeComponent },
      { path: 'talent',       component: EntrepreneurTalentComponent },
      { path: 'progressions',   component: EntrepreneurProgressionsComponent },
    ],
  },
];

@NgModule({
  declarations: [
    EntrepreneurDashboardComponent, EntrepreneurProjetsComponent, EntrepreneurWorkflowsComponent,
    EntrepreneurPlanningComponent, EntrepreneurMessagesComponent, EntrepreneurBibliothequeComponent,
    EntrepreneurTalentComponent,
  ],
  imports: [CommonModule, FormsModule, LayoutModule, SharedModule, RouterModule.forChild(routes)],
})
export class EntrepreneurModule {}
