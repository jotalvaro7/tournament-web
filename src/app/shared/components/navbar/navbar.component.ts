import { Component, inject, output, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  /** Event emitted when user wants to create a new tournament */
  createTournament = output<void>();

  /** Event emitted when user selects a tournament from dropdown */
  selectTournament = output<number>();

  /** Tournaments signal from service */
  readonly tournaments = this.tournamentService.tournaments;

  /** Loading state signal from service */
  readonly isLoading = this.tournamentService.isLoading;

  /** Currently selected tournament ID */
  private readonly selectedTournamentId = signal<number | null>(null);

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
      this.selectedTournamentId.set(tournamentId);
      this.selectTournament.emit(tournamentId);
    } else {
      this.selectedTournamentId.set(null);
    }
  }

  /** Handles create tournament button click */
  onCreateClick(): void {
    this.createTournament.emit();
  }
}
