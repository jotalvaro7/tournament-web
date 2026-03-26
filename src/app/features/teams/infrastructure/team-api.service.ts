import { Injectable, Signal, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Team, TeamRequestDto, TeamResponseDto } from '../domain/models';
import { Match, MatchResponse } from '@app/features/matches/domain/models';

/**
 * Team API Service (Infrastructure Layer - Adapter)
 *
 * Handles HTTP communication with the backend API for team operations.
 * Maps DTOs to domain models.
 *
 * Architecture: Ports & Adapters Pattern
 * This is an adapter that implements the port defined by the domain.
 **/ 
@Injectable({
  providedIn: 'root'
})
export class TeamApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Gets all teams for a specific tournament
   */
  getAllByTournamentResource(tournamentId: Signal<number | null>) {
    return httpResource<Team[]>(
      () => {
      const tournamentIdValue = tournamentId();
      return tournamentIdValue ? `${this.baseUrl}/tournaments/${tournamentIdValue}/teams` : undefined
      }
    );
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
   * Gets standings (teams sorted by points and goal difference) for a tournament
   */
  getStandingsResource(tournamentId: Signal<number | null>) {
    return httpResource<Team[]>(
      () => {
        const id = tournamentId();
        return id ? `${this.baseUrl}/tournaments/${id}/teams/standings` : undefined;
      }
    );
  }

  /**
   * Gets all matches played by a team
   */
  getMatchesByTeamResource(tournamentId: Signal<number | null>, teamId: Signal<number | null>) {
    return httpResource<Match[]>(
      () => {
        const tId = tournamentId();
        const tmId = teamId();
        return tId && tmId ? `${this.baseUrl}/tournaments/${tId}/teams/${tmId}/matches` : undefined;
      },
      {
        parse: (raw: unknown) => (raw as MatchResponse[]).map(r => new Match(
          r.id, r.tournamentId, r.homeTeamId, r.awayTeamId,
          r.homeTeamScore, r.awayTeamScore, new Date(r.matchDate),
          r.field, r.status
        ))
      }
    );
  }

  /**
   * Maps DTO to Domain Model
   * Direct mapping since TeamResponseDto and Team have the same structure
   */
  private mapToModel(dto: TeamResponseDto): Team {
    return dto;
  }
}
