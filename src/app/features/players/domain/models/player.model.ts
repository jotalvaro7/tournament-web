/**
 * Player Domain Model
 *
 * Represents a player entity belonging to a team.
 * Maps directly to the PlayerResponse from the backend API.
 * Business validations are handled by the backend.
 */
export interface Player {
  id: number;
  name: string;
  lastName: string;
  identificationNumber: string;
  teamId: number;
}

/**
 * Player Helper
 *
 * Provides UI utility methods for player presentation.
 */
export class PlayerHelper {
  /**
   * Returns the player's full name
   */
  static getFullName(player: Player): string {
    return `${player.name} ${player.lastName}`;
  }
}
