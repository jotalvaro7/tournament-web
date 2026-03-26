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
