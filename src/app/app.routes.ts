import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
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
        loadComponent: () =>
          import('./features/tournaments/tournaments.component').then(m => m.TournamentsComponent)
      },
      {
        path: 'tournaments/:id',
        loadComponent: () =>
          import('./features/tournaments/tournaments.component').then(m => m.TournamentsComponent)
      }
    ]
  }
];
