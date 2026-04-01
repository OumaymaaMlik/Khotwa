import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./features/landing/landing.module').then(m => m.LandingModule) },
  { path: 'login', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'khotwaadmin', loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule) },
  { path: 'entrepreneur', loadChildren: () => import('./features/entrepreneur/entrepreneur.module').then(m => m.EntrepreneurModule) },
  { path: 'coach', loadChildren: () => import('./features/coach/coach.module').then(m => m.CoachModule) },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
