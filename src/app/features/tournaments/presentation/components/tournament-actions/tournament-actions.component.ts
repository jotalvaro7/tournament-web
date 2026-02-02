import { Component, input, output } from '@angular/core';
import { Tournament, TournamentHelper } from '../../../domain/models';

/**
 * Tournament Actions Component
 *
 * Displays available actions for a tournament.
 * Emits events for each action to be handled by parent component.
 *
 * Responsibilities:
 * - Display action buttons with appropriate styling
 * - Emit events when actions are clicked
 * - Show help text about backend validation
 *
 * This component is purely presentational and doesn't handle business logic.
 * Parent component is responsible for executing actions and handling responses.
 */
@Component({
  selector: 'app-tournament-actions',
  standalone: true,
  imports: [],
  templateUrl: './tournament-actions.component.html'
})
export class TournamentActionsComponent {
  /**
   * Tournament to display actions for
   */
  readonly tournament = input.required<Tournament>();

  /**
   * Emitted when edit button is clicked
   */
  readonly edit = output<void>();

  /**
   * Emitted when start button is clicked
   */
  readonly start = output<void>();

  /**
   * Emitted when end button is clicked
   */
  readonly end = output<void>();

  /**
   * Emitted when cancel button is clicked
   */
  readonly cancel = output<void>();

  /**
   * Emitted when delete button is clicked
   */
  readonly delete = output<void>();

  /**
   * Helper class for UI utilities
   */
  readonly helper = TournamentHelper;
  
}
