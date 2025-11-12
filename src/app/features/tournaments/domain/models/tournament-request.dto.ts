/**
 * Tournament Request DTO
 *
 * Data Transfer Object for creating or updating a tournament.
 * Matches the TournamentRequest schema from api.yml
 */
export interface TournamentRequestDto {
  /**
   * Tournament name (must be unique)
   * Min: 3 characters, Max: 100 characters
   */
  name: string;

  /**
   * Tournament description
   * Min: 10 characters, Max: 500 characters
   */
  description: string;
}
