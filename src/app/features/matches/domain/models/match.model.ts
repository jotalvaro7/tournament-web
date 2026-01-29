import { MatchStatus } from './match-status.enum';

/**
 * Match Domain Model
 *
 * Represents a match between two teams in a tournament
 * Pure data model with helper methods for UI presentation
 *
 * Important: Business validations are handled by the backend.
 * The backend will return appropriate errors if operations are invalid.
 * Error interceptor automatically displays these errors to the user.
 *
 * State Machine:
 * - SCHEDULED: Initial state
 * - FINISHED: Final state with scores (scores can still be corrected)
 * - POSTPONED: Temporary state, can return to SCHEDULED
 *
 * This model focuses on:
 * - Data representation
 * - UI helper methods (formatting, colors, labels)
 * - State checking (read-only properties)
 */
export class Match {
  constructor(
    public readonly id: number,
    public readonly tournamentId: number,
    public readonly homeTeamId: number,
    public readonly awayTeamId: number,
    public readonly homeTeamScore: number | null,
    public readonly awayTeamScore: number | null,
    public readonly matchDate: Date,
    public readonly field: string,
    public readonly status: MatchStatus
  ) {}

  /**
   * Checks if match is scheduled
   */
  isScheduled(): boolean {
    return this.status === MatchStatus.SCHEDULED;
  }

  /**
   * Checks if match is finished
   */
  isFinished(): boolean {
    return this.status === MatchStatus.FINISHED;
  }

  /**
   * Checks if match is postponed
   */
  isPostponed(): boolean {
    return this.status === MatchStatus.POSTPONED;
  }

  /**
   * Checks if match can be postponed (UI helper)
   * Only non-finished matches show postpone button
   * Backend will validate if postpone operation is allowed
   */
  canBePostponed(): boolean {
    return !this.isFinished();
  }

  /**
   * Checks if match has a result
   */
  hasResult(): boolean {
    return this.homeTeamScore !== null && this.awayTeamScore !== null;
  }

  /**
   * Gets match winner
   * @returns 'home' | 'away' | 'draw' | null
   */
  getWinner(): 'home' | 'away' | 'draw' | null {
    if (!this.hasResult()) {
      return null;
    }

    if (this.homeTeamScore! > this.awayTeamScore!) {
      return 'home';
    } else if (this.awayTeamScore! > this.homeTeamScore!) {
      return 'away';
    } else {
      return 'draw';
    }
  }

  /**
   * Gets formatted match date
   */
  getFormattedDate(): string {
    return this.matchDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Gets match status badge color (subtle, not saturated)
   * For UI styling purposes
   */
  getStatusColor(): string {
    switch (this.status) {
      case MatchStatus.SCHEDULED:
        return 'bg-gray-100 text-gray-700 border-l-4 border-gray-400';
      case MatchStatus.FINISHED:
        return 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-400';
      case MatchStatus.POSTPONED:
        return 'bg-amber-50 text-amber-700 border-l-4 border-amber-400';
      default:
        return 'bg-gray-50 text-gray-700 border-l-4 border-gray-400';
    }
  }

  /**
   * Gets match status label in Spanish
   */
  getStatusLabel(): string {
    switch (this.status) {
      case MatchStatus.SCHEDULED:
        return 'Programado';
      case MatchStatus.FINISHED:
        return 'Finalizado';
      case MatchStatus.POSTPONED:
        return 'Pospuesto';
      default:
        return this.status;
    }
  }
}
