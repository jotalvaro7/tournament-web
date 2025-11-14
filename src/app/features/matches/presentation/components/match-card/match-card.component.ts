import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../../../domain/models';

/**
 * Match Card Component
 *
 * Ultra-minimalist list item for matches
 * Clean horizontal layout with essential information only
 *
 * Features:
 * - Horizontal team vs team layout with circular team icons
 * - Score display for finished matches
 * - Subtle status indicator (left border color)
 * - Border separator between items
 * - Hover effect with float animation and shadow
 * - Click entire card to open modal with actions
 * - No visible buttons - all actions handled in modal
 * - Responsive design
 * - OnPush for performance
 */
@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchCardComponent {
  /** Match to display */
  readonly match = input.required<Match>();

  /** Home team name */
  readonly homeTeamName = input<string>('Equipo Local');

  /** Away team name */
  readonly awayTeamName = input<string>('Equipo Visitante');

  /** Event emitted when card is clicked */
  readonly cardClick = output<Match>();

  /** Event emitted when edit button is clicked */
  readonly editClick = output<Match>();

  /** Event emitted when delete button is clicked */
  readonly deleteClick = output<Match>();

  /** Event emitted when finish button is clicked */
  readonly finishClick = output<Match>();

  /** Event emitted when postpone button is clicked */
  readonly postponeClick = output<Match>();

  /**
   * Handles card click
   */
  onCardClick(): void {
    this.cardClick.emit(this.match());
  }

  /**
   * Gets subtle border color based on match status
   */
  getStatusBorderColor(): string {
    const status = this.match().status;
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-400';
      case 'FINISHED':
        return 'bg-green-400';
      case 'POSTPONED':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-300';
    }
  }
}
