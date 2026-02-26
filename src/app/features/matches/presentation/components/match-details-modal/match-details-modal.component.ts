import { Component, input, output } from '@angular/core';

import { Match } from '../../../domain/models';

/**
 * Match Details Modal Component
 *
 * Full-screen modal showing match details
 * Modern and youthful design
 *
 * Features:
 * - Large team vs team display
 * - Score display for finished matches
 * - Match information (date, field, status)
 * - Action buttons
 * - Backdrop click to close
 * - Zoneless change detection with signals
 */
@Component({
  selector: 'app-match-details-modal',
  standalone: true,
  imports: [],
  templateUrl: './match-details-modal.component.html'
})
export class MatchDetailsModalComponent {
  /** Match to display */
  readonly match = input.required<Match>();

  /** Home team name */
  readonly homeTeamName = input<string>('Equipo Local');

  /** Away team name */
  readonly awayTeamName = input<string>('Equipo Visitante');

  /** Event emitted when modal is closed */
  readonly close = output<void>();

  /** Event emitted when edit is clicked */
  readonly edit = output<Match>();

  /** Event emitted when delete is clicked */
  readonly delete = output<Match>();

  /** Event emitted when finish is clicked */
  readonly finish = output<Match>();

  /** Event emitted when postpone is clicked */
  readonly postpone = output<Match>();

  /**
   * Handle close button
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Handle edit button
   */
  onEdit(): void {
    this.edit.emit(this.match());
    this.close.emit();
  }

  /**
   * Handle delete button
   */
  onDelete(): void {
    this.delete.emit(this.match());
    this.close.emit();
  }

  /**
   * Handle finish button
   */
  onFinish(): void {
    this.finish.emit(this.match());
    this.close.emit();
  }

  /**
   * Handle postpone button
   */
  onPostpone(): void {
    this.postpone.emit(this.match());
    this.close.emit();
  }
}
