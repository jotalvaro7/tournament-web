import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { TournamentService } from '@app/features/tournaments/application/services';
import { AuthService } from '@app/features/auth/application/services';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private readonly tournamentService = inject(TournamentService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isAdmin = this.authService.isAdmin;
  readonly tournaments = this.tournamentService.tournaments;
  readonly isLoading = this.tournamentService.isLoading;

  readonly selectedId = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const match = this.router.url.match(/\/tournaments\/(\d+)/);
        return match ? Number(match[1]) : null;
      })
    ),
    { initialValue: null }
  );

  onSelect(id: number): void {
    this.router.navigate(['/tournaments', id]);
  }

  onCreate(): void {
    this.router.navigate(['/tournaments', 'new']);
  }
}
