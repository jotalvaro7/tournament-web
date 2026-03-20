import { Injectable, Signal, inject } from '@angular/core';
import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Match, MatchResponse, MatchRequest, FinishMatchRequest, MatchFilterParams, PageResponseMatch } from '../domain/models';
import { environment } from '@environments/environment';

type PageResponseMatches = Omit<PageResponseMatch, 'content'> & { content: Match[] };

/**
 * Match API Service (Infrastructure Layer)
 *
 * Handles HTTP communication with match endpoints
 * Implements the repository pattern for match data access
 *
 * Endpoints:
 * - GET    /{tournamentId}/teams - Get all matches in tournament
 * - POST   /{tournamentId}/teams - Create match
 * - GET    /{tournamentId}/teams/{id} - Get match by ID
 * - PUT    /{tournamentId}/teams/{id} - Update match
 * - DELETE /{tournamentId}/teams/{id} - Delete match
 * - PUT    /{tournamentId}/matches/{id}/result - Set match result
 * - POST   /{tournamentId}/matches/{id}/postpone - Postpone match
 */
@Injectable({
  providedIn: 'root'
})
export class MatchApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tournaments`;

  /**
   * Get all matches in a tournament with filters and pagination
   */
  getMatchesByTournament(tournamentId: number, filters?: MatchFilterParams): Observable<PageResponseMatch> {
    let params = new HttpParams();

    if (filters) {
      if (filters.specificDate) params = params.set('specificDate', filters.specificDate);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page !== undefined) params = params.set('page', filters.page.toString());
      if (filters.size !== undefined) params = params.set('size', filters.size.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.direction) params = params.set('direction', filters.direction);
    }

    return this.http.get<PageResponseMatch>(`${this.baseUrl}/${tournamentId}/matches`, { params });
  }

  /**
   * Get match by ID
   */
  getMatchById(tournamentId: number, matchId: number): Observable<MatchResponse> {
    return this.http.get<MatchResponse>(`${this.baseUrl}/${tournamentId}/matches/${matchId}`);
  }

  /**
   * Create a new match
   */
  createMatch(tournamentId: number, request: MatchRequest): Observable<MatchResponse> {
    return this.http.post<MatchResponse>(`${this.baseUrl}/${tournamentId}/matches`, request);
  }

  /**
   * Update match details (date, field, teams)
   */
  updateMatch(tournamentId: number, matchId: number, request: MatchRequest): Observable<MatchResponse> {
    return this.http.put<MatchResponse>(`${this.baseUrl}/${tournamentId}/matches/${matchId}`, request);
  }

  /**
   * Delete match
   */
  deleteMatch(tournamentId: number, matchId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${tournamentId}/matches/${matchId}`);
  }

  /**
   * Set match result (finish match with scores)
   * Can be used to update scores even for finished matches
   */
  finishMatch(tournamentId: number, matchId: number, request: FinishMatchRequest): Observable<MatchResponse> {
    return this.http.put<MatchResponse>(`${this.baseUrl}/${tournamentId}/matches/${matchId}/result`, request);
  }

  /**
   * Postpone match
   */
  postponeMatch(tournamentId: number, matchId: number): Observable<MatchResponse> {
    return this.http.post<MatchResponse>(`${this.baseUrl}/${tournamentId}/matches/${matchId}/postpone`, {});
  }

  /**
   * Get paginated matches for a tournament with optional filters (reactive)
   */
  getMatchesByTournamentResource(
    tournamentId: Signal<number | null>,
    filters: Signal<MatchFilterParams | undefined>
  ) {
    return httpResource<PageResponseMatches>(() => {
      const tId = tournamentId();
      if (!tId) return undefined;

      const f = filters();
      const params: Record<string, string | number> = {};

      if (f?.specificDate)       params['specificDate'] = f.specificDate;
      if (f?.dateFrom)           params['dateFrom']     = f.dateFrom;
      if (f?.dateTo)             params['dateTo']       = f.dateTo;
      if (f?.status)             params['status']       = f.status;
      if (f?.page !== undefined) params['page']         = f.page;
      if (f?.size !== undefined) params['size']         = f.size;
      if (f?.sortBy)             params['sortBy']       = f.sortBy;
      if (f?.direction)          params['direction']    = f.direction;

      return { url: `${this.baseUrl}/${tId}/matches`, params };
    }, {
      parse: (raw: unknown) => {
        const response = raw as PageResponseMatch;
        return {
          ...response,
          content: response.content.map(r => new Match(
            r.id, r.tournamentId, r.homeTeamId, r.awayTeamId,
            r.homeTeamScore, r.awayTeamScore, new Date(r.matchDate),
            r.field, r.status
          ))
        };
      }
    });
  }
}
