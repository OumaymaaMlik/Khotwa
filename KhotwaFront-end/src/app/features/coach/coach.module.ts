import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '../../layout/layout.module';
import { LayoutComponent } from '../../layout/layout.component';

import { CoachDashboardComponent }    from './dashboard/dashboard.component';
import { CoachProjetsComponent }       from './projets/projets.component';
import { CoachStartupsComponent }      from './startups/startups.component';
import { CoachValidationsComponent }   from './validations/validations.component';
import { CoachPlanningComponent }      from './planning/planning.component';
import { CoachMessagesComponent }      from './messages/messages.component';
import { CoachBibliothequeComponent }  from './bibliotheque/bibliotheque.component';
import { CoachTalentComponent }         from './talent/talent.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    component: CoachDashboardComponent },
      { path: 'projets',      component: CoachProjetsComponent },
      { path: 'startups',     component: CoachStartupsComponent },
      { path: 'validations',  component: CoachValidationsComponent },
      { path: 'planning',     component: CoachPlanningComponent },
      { path: 'messages',     component: CoachMessagesComponent },
      { path: 'bibliotheque', component: CoachBibliothequeComponent },
      { path: 'talent',       component: CoachTalentComponent },
    ],
  },
];

@NgModule({
  declarations: [
    CoachDashboardComponent, CoachProjetsComponent, CoachStartupsComponent,
    CoachValidationsComponent, CoachPlanningComponent, CoachMessagesComponent, CoachBibliothequeComponent,
    CoachTalentComponent,
  ],
  imports: [CommonModule, FormsModule, LayoutModule, RouterModule.forChild(routes)],
})
export class CoachModule {}
