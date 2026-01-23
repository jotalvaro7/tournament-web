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
          },
          {
            path: ':id/teams/:teamId/players',
            loadComponent: () =>
              import('./features/players/presentation/components/player-list/player-list.component')
                .then(m => m.PlayerListComponent)
          },
          {
            path: ':id/matches',
            loadComponent: () =>
              import('./features/matches/presentation/components/match-list/match-list.component')
                .then(m => m.MatchListComponent)
          }
        ]
      }
    ]
  }
];
