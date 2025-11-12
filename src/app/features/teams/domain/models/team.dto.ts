/**
 * Team Request DTO
 * Data structure for creating/updating a team
 * Maps to TeamRequest in API documentation
 */
export interface TeamRequestDto {
  name: string;
  coach: string;
}

/**
 * Team Response DTO
 * Data structure received from API
 * Maps to TeamResponse in API documentation
 * Includes tournament statistics
 */
export interface TeamResponseDto {
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
