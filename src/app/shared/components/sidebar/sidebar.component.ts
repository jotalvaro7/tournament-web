import { Component, ChangeDetectionStrategy, input, inject, OnInit, output } from '@angular/core';
import { TournamentService } from '@app/features/tournaments/application/services';
import { TournamentSelectorComponent } from './tournament-selector/tournament-selector.component';
import { NavigationItemsComponent, NavItem } from './navigation-items/navigation-items.component';

/**
 * Sidebar Component
 *
 * Collapsible navigation sidebar with animated transitions.
 * Displays navigation items and tournament dropdown selector.
 *
 * Features:
 * - Collapsible (expanded/collapsed states)
 * - Smooth transitions with Tailwind
 * - Tournament dropdown selector (only visible if tournaments exist)
 * - Create tournament button
 * - OnPush change detection for performance
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
   * Navigation items
   */
  navItems: NavItem[] = [
    {
      label: 'Tournaments',
      icon: 'fas fa-trophy',
      route: '/tournaments'
    }
  ];

  ngOnInit(): void {
    // Load tournaments on init
    this.tournamentService.loadTournaments();
  }

  /**
   * Handles tournament selection from dropdown
   */
  onTournamentSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const tournamentId = Number(select.value);

    if (tournamentId) {
      this.selectTournament.emit(tournamentId);
    }
  }

  /**
   * Handles create tournament button click
   */
  onCreateClick(): void {
    this.createTournament.emit();
  }
}
