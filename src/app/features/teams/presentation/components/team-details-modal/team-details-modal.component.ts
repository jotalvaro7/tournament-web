import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Team, TeamHelper } from '../../../domain/models';

/**
 * Team Details Modal Component
 *
 * Displays comprehensive team statistics in a modern modal with table format.
 * Reusable component that can be used in different contexts.
 *
 * Features:
 * - Modal overlay with backdrop
 * - Horizontal table with all team statistics
 * - Action buttons: Edit, Delete, Close
 * - Color-coded badges for points and goal difference
 * - Semantic colors for W/D/L record
 * - OnPush change detection for performance
 *
 * Architecture:
 * - Pure presentation component (dumb component)
 * - No business logic, only displays data
 * - Communicates via inputs/outputs
 */
@Component({
  selector: 'app-team-details-modal',
  standalone: true,
  imports: [],
  templateUrl: './team-details-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamDetailsModalComponent {
  /**
   * Team to display (null = modal closed)
   */
  team = input<Team | null>(null);

  /**
   * Event emitted when user closes the modal
   */
  close = output<void>();

  /**
   * Event emitted when user clicks Edit button
   */
  edit = output<Team>();

  /**
   * Event emitted when user clicks Delete button
   */
  delete = output<Team>();

  /**
   * Event emitted when user clicks View Players button
   */
  viewPlayers = output<Team>();

  /**
   * Event emitted when user clicks View Matches button
   */
  viewMatches = output<Team>();

  /**
   * Helper class for UI utilities
   */
  readonly helper = TeamHelper;

  /**
   * Handles close button click
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Handles backdrop click
   */
  onBackdropClick(): void {
    this.close.emit();
  }

  /**
   * Handles edit button click
   */
  onEdit(): void {
    const team = this.team();
    if (team) {
      this.edit.emit(team);
    }
  }

  /**
   * Handles delete button click
   */
  onDelete(): void {
    const team = this.team();
    if (team) {
      this.delete.emit(team);
    }
  }

  /**
   * Handles view players button click
   */
  onViewPlayers(): void {
    const team = this.team();
    if (team) {
      this.viewPlayers.emit(team);
    }
  }

  /**
   * Handles view matches button click
   */
  onViewMatches(): void {
    const team = this.team();
    if (team) {
      this.viewMatches.emit(team);
    }
  }
}
