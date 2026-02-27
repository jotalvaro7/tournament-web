import { Component, inject, output, computed } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { TournamentService } from '@app/features/tournaments/application/services';
import { TournamentSelectorComponent } from './tournament-selector/tournament-selector.component';
import { NavigationItemsComponent, NavItem } from './navigation-items/navigation-items.component';

/**
 * Navbar Component
 *
 * Top navigation header with tournament selector and navigation links.
 * Replaces the former sidebar + navbar split layout.
 *
 * Features:
 * - Logo/title on the left
 * - Tournament dropdown selector
 * - Contextual navigation (Teams, Matches) when a tournament is selected
 * - Create tournament button
 * - User profile area (placeholder)
 * - Zoneless change detection with signals
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, TournamentSelectorComponent, NavigationItemsComponent],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  private readonly tournamentService = inject(TournamentService);
  private readonly router = inject(Router);

  /** Event emitted when user wants to create a new tournament */
  createTournament = output<void>();

  /** Event emitted when user selects a tournament from dropdown */
  selectTournament = output<number>();

  /** Tournaments signal from service */
  readonly tournaments = this.tournamentService.tournaments;

  /** Loading state signal from service */
  readonly isLoading = this.tournamentService.isLoading;

  /**
   * Currently selected tournament ID derived from the router URL.
   * Updates automatically on any navigation, including programmatic navigation
   * after tournament creation.
   */
  readonly selectedTournamentId = toSignal(
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

  /** Dynamic navigation items based on selected tournament */
  readonly navItems = computed<NavItem[]>(() => {
    const tournamentId = this.selectedTournamentId();

    if (!tournamentId) {
      return [];
    }

    return [
      {
        label: 'Teams',
        icon: 'fas fa-users',
        route: `/tournaments/${tournamentId}/teams`
      },
      {
        label: 'Matches',
        icon: 'fas fa-calendar-check',
        route: `/tournaments/${tournamentId}/matches`
      }
    ];
  });

  constructor() {
    this.tournamentService.loadTournaments();
  }

  /** Handles tournament selection from dropdown */
  onTournamentSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const tournamentId = Number(select.value);

    if (tournamentId) {
      this.selectTournament.emit(tournamentId);
    }
  }

  /** Handles create tournament button click */
  onCreateClick(): void {
    this.createTournament.emit();
  }
}
