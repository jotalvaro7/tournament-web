import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TournamentRequestDto, TournamentResponseDto } from '../domain/models';
import { environment } from '@environments/environment';

/**
 * Tournament API Service (Infrastructure Layer)
 *
 * HTTP adapter for tournament REST API operations.
 * Handles all HTTP communication with the backend.
 *
 * This service is part of the infrastructure layer and should not contain
 * business logic. It's responsible only for HTTP calls.
 *
 * Architecture: Ports & Adapters pattern
 * - This is the Adapter (HTTP implementation)
 * - TournamentService is the Port (business interface)
 */
@Injectable({
  providedIn: 'root'
})
export class TournamentApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tournaments`;

  /**
   * GET /api/tournaments
   * Retrieve all tournaments
   */
  getAll(): Observable<TournamentResponseDto[]> {
    return this.http.get<TournamentResponseDto[]>(this.apiUrl);
  }

  /**
   * GET /api/tournaments/{id}
   * Retrieve a specific tournament by ID
   */
  getById(id: number): Observable<TournamentResponseDto> {
    return this.http.get<TournamentResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * POST /api/tournaments
   * Create a new tournament
   */
  create(request: TournamentRequestDto): Observable<TournamentResponseDto> {
    return this.http.post<TournamentResponseDto>(this.apiUrl, request);
  }

  /**
   * PUT /api/tournaments/{id}
   * Update an existing tournament
   */
  update(id: number, request: TournamentRequestDto): Observable<TournamentResponseDto> {
    return this.http.put<TournamentResponseDto>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * DELETE /api/tournaments/{id}
   * Delete a tournament (only allowed if status is CREATED or CANCELLED)
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * PATCH /api/tournaments/{id}/start
   * Start a tournament (CREATED → IN_PROGRESS)
   */
  start(id: number): Observable<TournamentResponseDto> {
    return this.http.patch<TournamentResponseDto>(`${this.apiUrl}/${id}/start`, {});
  }

  /**
   * PATCH /api/tournaments/{id}/end
   * End a tournament (IN_PROGRESS → COMPLETED)
   */
  end(id: number): Observable<TournamentResponseDto> {
    return this.http.patch<TournamentResponseDto>(`${this.apiUrl}/${id}/end`, {});
  }

  /**
   * PATCH /api/tournaments/{id}/cancel
   * Cancel a tournament (any state except COMPLETED → CANCELLED)
   */
  cancel(id: number): Observable<TournamentResponseDto> {
    return this.http.patch<TournamentResponseDto>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
