import { Component, input, output, Signal } from '@angular/core';
import { Tournament } from '@app/features/tournaments/domain/models';

/**
 * Tournament Selector Component (Header variant)
 *
 * Compact horizontal tournament dropdown for the header bar.
 * Shows a dropdown when tournaments exist, or a create button when empty.
 *
 * This component is purely presentational.
 * Parent component handles the actual tournament selection logic.
 */
@Component({
  selector: 'app-tournament-selector',
  standalone: true,
  imports: [],
  templateUrl: './tournament-selector.component.html'
})
export class TournamentSelectorComponent {
  /** Tournaments list signal */
  readonly tournaments = input.required<Signal<Tournament[]>>();

  /** Loading state signal */
  readonly isLoading = input.required<Signal<boolean>>();

  /** Emitted when create button is clicked */
  readonly createTournament = output<void>();

  /** Emitted when tournament is selected from dropdown */
  readonly selectTournament = output<Event>();
}
