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
        loadChildren: () =>
          import('./features/tournaments/tournaments.routes').then(m => m.TOURNAMENT_ROUTES)
      }
    ]
  }
];
