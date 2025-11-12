/**
 * Team Domain Model
 *
 * Represents a team entity with tournament statistics.
 * Maps directly to the TeamResponse from the backend API.
 * Business validations are handled by the backend.
 */
export interface Team {
  id: number;
  name: string;
  coach: string;
  tournamentId: number;
  points: number;
  matchesPlayed: number;
  matchesWin: number;
  matchesDraw: number;
  matchesLost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

/**
 * Team Helper
 *
 * Provides UI utility methods for team presentation.
 */
export class TeamHelper {
  /**
   * Returns Tailwind CSS classes for points badge
   * Higher points = better color
   */
  static getPointsColor(points: number): string {
    if (points >= 9) return 'bg-green-100 text-green-800';
    if (points >= 6) return 'bg-blue-100 text-blue-800';
    if (points >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  }

  /**
   * Returns Tailwind CSS classes for goal difference badge
   */
  static getGoalDifferenceColor(goalDiff: number): string {
    if (goalDiff > 0) return 'bg-green-100 text-green-800';
    if (goalDiff < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  }
}
