import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Team, TeamRequestDto, TeamResponseDto } from '../domain/models';

/**
 * Team API Service (Infrastructure Layer - Adapter)
 *
 * Handles HTTP communication with the backend API for team operations.
 * Maps DTOs to domain models.
 *
 * Architecture: Ports & Adapters Pattern
 * This is an adapter that implements the port defined by the domain.
 *
 * Endpoints (to be implemented in backend):
 * - GET    /tournaments/{tournamentId}/teams       - List all teams
 * - GET    /tournaments/{tournamentId}/teams/{id}  - Get team by ID
 * - POST   /tournaments/{tournamentId}/teams       - Create team
 * - PUT    /tournaments/{tournamentId}/teams/{id}  - Update team
 * - DELETE /tournaments/{tournamentId}/teams/{id}  - Delete team
 */
@Injectable({
  providedIn: 'root'
})
export class TeamApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Gets all teams for a specific tournament
   */
  getAllByTournament(tournamentId: number): Observable<Team[]> {
    return this.http
      .get<TeamResponseDto[]>(`${this.baseUrl}/tournaments/${tournamentId}/teams`)
      .pipe(map(dtos => dtos.map(this.mapToModel)));
  }

  /**
   * Gets a team by ID within a tournament
   */
  getById(tournamentId: number, teamId: number): Observable<Team> {
    return this.http
      .get<TeamResponseDto>(`${this.baseUrl}/tournaments/${tournamentId}/teams/${teamId}`)
      .pipe(map(this.mapToModel));
  }

  /**
   * Creates a new team in a tournament
   */
  create(tournamentId: number, request: TeamRequestDto): Observable<Team> {
    return this.http
      .post<TeamResponseDto>(`${this.baseUrl}/tournaments/${tournamentId}/teams`, request)
      .pipe(map(this.mapToModel));
  }

  /**
   * Updates an existing team
   */
  update(tournamentId: number, teamId: number, request: TeamRequestDto): Observable<Team> {
    return this.http
      .put<TeamResponseDto>(`${this.baseUrl}/tournaments/${tournamentId}/teams/${teamId}`, request)
      .pipe(map(this.mapToModel));
  }

  /**
   * Deletes a team from a tournament
   */
  delete(tournamentId: number, teamId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tournaments/${tournamentId}/teams/${teamId}`);
  }

  /**
   * Maps DTO to Domain Model
   * Direct mapping since TeamResponseDto and Team have the same structure
   */
  private mapToModel(dto: TeamResponseDto): Team {
    return dto;
  }
}
