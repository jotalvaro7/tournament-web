import { Component, ChangeDetectionStrategy, input, inject, OnInit, output, signal, computed } from '@angular/core';
import { TournamentService } from '@app/features/tournaments/application/services';
import { TournamentSelectorComponent } from './tournament-selector/tournament-selector.component';
import { NavigationItemsComponent, NavItem } from './navigation-items/navigation-items.component';

/**
 * Sidebar Component
 *
 * Collapsible navigation sidebar with animated transitions.
 * Displays tournament selector and dynamic contextual navigation.
 *
 * Features:
 * - Collapsible (expanded/collapsed states)
 * - Tournament dropdown selector
 * - Dynamic navigation items based on selected tournament
 * - Create tournament button
 * - OnPush change detection for performance
 *
 * Navigation behavior:
 * - No tournament selected: navItems is empty
 * - Tournament selected: shows Teams navigation item
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [TournamentSelectorComponent, NavigationItemsComponent],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  private readonly tournamentService = inject(TournamentService);

  /**
   * Controls sidebar visibility state
   * true = expanded, false = collapsed
   */
  isOpen = input.required<boolean>();

  /**
   * Event emitted when user wants to create a new tournament
   */
  createTournament = output<void>();

  /**
   * Event emitted when user selects a tournament from dropdown
   */
  selectTournament = output<number>();

  /**
   * Tournaments signal from service
   */
  readonly tournaments = this.tournamentService.tournaments;

  /**
   * Loading state signal from service
   */
  readonly isLoading = this.tournamentService.isLoading;

  /**
   * Currently selected tournament ID
   * Used to generate dynamic navigation items
   */
  private readonly selectedTournamentId = signal<number | null>(null);

  /**
   * Dynamic navigation items based on selected tournament
   * Empty when no tournament is selected
   * Shows Teams item when tournament is selected
   */
  readonly navItems = computed<NavItem[]>(() => {
    const tournamentId = this.selectedTournamentId();

    if (!tournamentId) {
      return []; // No tournament selected, no navigation
    }

    return [
      {
        label: 'Teams',
        icon: 'fas fa-users',
        route: `/tournaments/${tournamentId}/teams`
      }
      // Future: Add more items (Matches, Statistics, etc.)
    ];
  });

  ngOnInit(): void {
    // Load tournaments on init
    this.tournamentService.loadTournaments();
  }

  /**
   * Handles tournament selection from dropdown
   * Updates selected tournament and generates dynamic navigation
   */
  onTournamentSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const tournamentId = Number(select.value);

    if (tournamentId) {
      this.selectedTournamentId.set(tournamentId); // Updates navItems automatically via computed
      this.selectTournament.emit(tournamentId);
    } else {
      this.selectedTournamentId.set(null); // Clears navItems
    }
  }

  /**
   * Handles create tournament button click
   */
  onCreateClick(): void {
    this.createTournament.emit();
  }
}
