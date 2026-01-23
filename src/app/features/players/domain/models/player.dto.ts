/**
 * Player Request DTO
 * Data structure for creating/updating a player
 * Maps to PlayerRequest in API documentation
 */
export interface PlayerRequestDto {
  name: string;
  lastName: string;
  identificationNumber: string;
}

/**
 * Player Response DTO
 * Data structure received from API
 * Maps to PlayerResponse in API documentation
 */
export interface PlayerResponseDto {
  id: number;
  name: string;
  lastName: string;
  identificationNumber: string;
  teamId: number;
}
