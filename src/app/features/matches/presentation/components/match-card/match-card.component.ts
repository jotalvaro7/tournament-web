import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../../../domain/models';

/**
 * Match Card Component
 *
 * Renders a single table row (<tr>) for a match.
 * Uses `display: contents` so the host element is transparent
 * and the <tr> integrates directly into the parent <tbody>.
 *
 * Features:
 * - Table row with Home, Score, Away, Date, Status columns
 * - Click row to open details modal
 * - Status badge with color coding
 * - Responsive: Date and Status hidden on small screens
 * - OnPush for performance
 */
@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-card.component.html',
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchCardComponent {
  readonly match = input.required<Match>();
  readonly homeTeamName = input<string>('Home');
  readonly awayTeamName = input<string>('Away');

  readonly cardClick = output<Match>();

  onCardClick(): void {
    this.cardClick.emit(this.match());
  }

  getStatusClasses(): Record<string, boolean> {
    const m = this.match();
    return {
      'bg-gray-100 text-gray-600': m.isScheduled(),
      'bg-emerald-50 text-emerald-700': m.isFinished(),
      'bg-amber-50 text-amber-700': m.isPostponed()
    };
  }
}
