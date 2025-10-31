import { TournamentStatus } from './tournament-status.enum';

/**
 * Tournament Response DTO
 *
 * Data Transfer Object received from API responses.
 * Matches the TournamentResponse schema from api.yml
 */
export interface TournamentResponseDto {
  /**
   * Tournament unique identifier
   */
  id: number;

  /**
   * Tournament name
   */
  name: string;

  /**
   * Tournament description
   */
  description: string;

  /**
   * Current tournament status
   */
  status: TournamentStatus;
}
