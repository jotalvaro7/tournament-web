import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Player, PlayerRequestDto, PlayerResponseDto } from '../domain/models';

/**
 * Player API Service (Infrastructure Layer - Adapter)
 *
 * Handles HTTP communication with the backend API for player operations.
 * Maps DTOs to domain models.
 *
 * Endpoints:
 * - GET    /tournaments/{tournamentId}/teams/{teamId}/players           - List all players
 * - GET    /tournaments/{tournamentId}/teams/{teamId}/players/{id}      - Get player by ID
 * - POST   /tournaments/{tournamentId}/teams/{teamId}/players           - Create player
 * - PUT    /tournaments/{tournamentId}/teams/{teamId}/players/{id}      - Update player
 * - DELETE /tournaments/{tournamentId}/teams/{teamId}/players/{id}      - Delete player
 */
@Injectable({
  providedIn: 'root'
})
export class PlayerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Gets all players for a specific team
   */
  getAllByTeam(tournamentId: number, teamId: number): Observable<Player[]> {
    return this.http
      .get<PlayerResponseDto[]>(this.buildUrl(tournamentId, teamId))
      .pipe(map(dtos => dtos.map(this.mapToModel)));
  }

  /**
   * Gets a player by ID
   */
  getById(tournamentId: number, teamId: number, playerId: number): Observable<Player> {
    return this.http
      .get<PlayerResponseDto>(`${this.buildUrl(tournamentId, teamId)}/${playerId}`)
      .pipe(map(this.mapToModel));
  }

  /**
   * Creates a new player in a team
   */
  create(tournamentId: number, teamId: number, request: PlayerRequestDto): Observable<Player> {
    return this.http
      .post<PlayerResponseDto>(this.buildUrl(tournamentId, teamId), request)
      .pipe(map(this.mapToModel));
  }

  /**
   * Updates an existing player
   */
  update(tournamentId: number, teamId: number, playerId: number, request: PlayerRequestDto): Observable<Player> {
    return this.http
      .put<PlayerResponseDto>(`${this.buildUrl(tournamentId, teamId)}/${playerId}`, request)
      .pipe(map(this.mapToModel));
  }

  /**
   * Deletes a player from a team
   */
  delete(tournamentId: number, teamId: number, playerId: number): Observable<void> {
    return this.http.delete<void>(`${this.buildUrl(tournamentId, teamId)}/${playerId}`);
  }

  /**
   * Builds the base URL for player endpoints
   */
  private buildUrl(tournamentId: number, teamId: number): string {
    return `${this.baseUrl}/tournaments/${tournamentId}/teams/${teamId}/players`;
  }

  /**
   * Maps DTO to Domain Model
   */
  private mapToModel(dto: PlayerResponseDto): Player {
    return dto;
  }
}