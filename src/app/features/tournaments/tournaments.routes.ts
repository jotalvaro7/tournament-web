import { Routes } from '@angular/router';
import { adminGuard } from '../auth/application/guards/admin.guard';

export const TOURNAMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tournaments.component').then(c => c.TournamentsComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./tournaments.component').then(c => c.TournamentsComponent)
  },
  {
    path: ':id/teams',
    loadComponent: () =>
      import('../teams/presentation/components/team-list/team-list.component')
        .then(c => c.TeamListComponent)
  },
  {
    path: ':id/teams/:teamId',
    loadComponent: () =>
      import('../teams/presentation/pages/team-page/team-page.component')
        .then(c => c.TeamPageComponent)
  },
  {
    path: ':id/teams/:teamId/players',
    loadComponent: () =>
      import('../players/presentation/components/player-list/player-list.component')
        .then(c => c.PlayerListComponent)
  },
  {
    path: ':id/matches',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('../matches/presentation/components/match-list/match-list.component')
        .then(c => c.MatchListComponent)
  }
];
