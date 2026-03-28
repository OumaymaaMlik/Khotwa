import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '../../layout/layout.module';
import { LayoutComponent } from '../../layout/layout.component';

import { AdminDashboardComponent }    from './dashboard/dashboard.component';
import { AdminProjetsComponent }       from './projets/projets.component';
import { AdminPlanningComponent }      from './planning/planning.component';
import { AdminMessagesComponent }      from './messages/messages.component';
import { AdminBibliothequeComponent }  from './bibliotheque/bibliotheque.component';
import { AdminUtilisateursComponent }  from './utilisateurs/utilisateurs.component';
import { AdminEvenementsComponent }    from './evenements/evenements.component';
import { AdminAbonnementsComponent }   from './abonnements/abonnements.component';
import { AdminTalentComponent }        from './talent/talent.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    component: AdminDashboardComponent },
      { path: 'projets',      component: AdminProjetsComponent },
      { path: 'planning',     component: AdminPlanningComponent },
      { path: 'messages',     component: AdminMessagesComponent },
      { path: 'bibliotheque', component: AdminBibliothequeComponent },
      { path: 'utilisateurs', component: AdminUtilisateursComponent },
      { path: 'evenements',   component: AdminEvenementsComponent },
      { path: 'abonnements',  component: AdminAbonnementsComponent },
      { path: 'talent',       component: AdminTalentComponent },
    ],
  },
];

@NgModule({
  declarations: [
    AdminDashboardComponent, AdminProjetsComponent, AdminPlanningComponent,
    AdminMessagesComponent, AdminBibliothequeComponent, AdminUtilisateursComponent,
    AdminEvenementsComponent, AdminAbonnementsComponent, AdminTalentComponent,
  ],
  imports: [CommonModule, FormsModule, LayoutModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
