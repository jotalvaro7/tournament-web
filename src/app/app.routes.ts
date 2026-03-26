import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/presentation/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'tournaments',
        pathMatch: 'full'
      },
      {
        path: 'tournaments',
        loadChildren: () =>
          import('./features/tournaments/tournaments.routes').then(m => m.TOURNAMENT_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
