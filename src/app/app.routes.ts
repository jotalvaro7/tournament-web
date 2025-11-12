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
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/tournaments/tournaments.component').then(m => m.TournamentsComponent)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/tournaments/tournaments.component').then(m => m.TournamentsComponent)
          },
          {
            path: ':id/teams',
            loadComponent: () =>
              import('./features/teams/presentation/components/team-list/team-list.component')
                .then(m => m.TeamListComponent)
          }
        ]
      }
    ]
  }
];
