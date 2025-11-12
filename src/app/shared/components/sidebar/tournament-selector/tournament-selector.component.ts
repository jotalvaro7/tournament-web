import { Component, ChangeDetectionStrategy, input, output, Signal } from '@angular/core';
import { Tournament } from '@app/features/tournaments/domain/models';

/**
 * Tournament Selector Component
 *
 * Displays tournament dropdown selector with create button.
 * Handles collapsed/expanded states.
 *
 * Responsibilities:
 * - Show dropdown when expanded and tournaments exist
 * - Show create button in all states
 * - Display loading indicator
 * - Show empty state message
 *
 * This component is purely presentational.
 * Parent component handles the actual tournament selection logic.
 */
@Component({
  selector: 'app-tournament-selector',
  standalone: true,
  imports: [],
  templateUrl: './tournament-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentSelectorComponent {
  /**
   * Controls expanded/collapsed view
   */
  readonly isOpen = input.required<boolean>();

  /**
   * Tournaments list signal
   */
  readonly tournaments = input.required<Signal<Tournament[]>>();

  /**
   * Loading state signal
   */
  readonly isLoading = input.required<Signal<boolean>>();

  /**
   * Emitted when create button is clicked
   */
  readonly createTournament = output<void>();

  /**
   * Emitted when tournament is selected from dropdown
   */
  readonly selectTournament = output<Event>();
}
