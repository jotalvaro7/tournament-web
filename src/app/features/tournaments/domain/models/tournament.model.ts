import { TournamentStatus } from './tournament-status.enum';

/**
 * Tournament Domain Model
 *
 * Represents a tournament entity.
 * This is the core domain model used throughout the application.
 *
 * Note: Business rules (state transitions, validations) are handled by the backend.
 * The frontend only provides UI helpers and display logic.
 */
export interface Tournament {
  id: number;
  name: string;
  description: string;
  status: TournamentStatus;
}

/**
 * UI Helpers for Tournament
 *
 * Contains only presentation logic, NO business rules.
 * Business validations are the backend's responsibility.
 */
export class TournamentHelper {
  /**
   * Gets display color classes for tournament status badge
   * Returns Tailwind CSS classes for text and background
   */
  static getStatusColor(status: TournamentStatus): string {
    switch (status) {
      case TournamentStatus.CREATED:
        return 'text-gray-700 bg-gray-100';
      case TournamentStatus.IN_PROGRESS:
        return 'text-blue-700 bg-blue-100';
      case TournamentStatus.COMPLETED:
        return 'text-emerald-700 bg-emerald-100';
      case TournamentStatus.CANCELLED:
        return 'text-red-700 bg-red-100';
    }
  }

  /**
   * Gets display label for tournament status
   */
  static getStatusLabel(status: TournamentStatus): string {
    switch (status) {
      case TournamentStatus.CREATED:
        return 'Created';
      case TournamentStatus.IN_PROGRESS:
        return 'In Progress';
      case TournamentStatus.COMPLETED:
        return 'Completed';
      case TournamentStatus.CANCELLED:
        return 'Cancelled';
    }
  }

  /**
   * Gets Font Awesome icon class for tournament status
   */
  static getStatusIcon(status: TournamentStatus): string {
    switch (status) {
      case TournamentStatus.CREATED:
        return 'fas fa-clock';
      case TournamentStatus.IN_PROGRESS:
        return 'fas fa-play-circle';
      case TournamentStatus.COMPLETED:
        return 'fas fa-check-circle';
      case TournamentStatus.CANCELLED:
        return 'fas fa-times-circle';
    }
  }
}
