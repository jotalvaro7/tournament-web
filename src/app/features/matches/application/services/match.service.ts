import { Injectable, inject, signal, computed } from '@angular/core';
import { finalize } from 'rxjs';
import { MatchApiService } from '../../infrastructure/match-api.service';
import { Match, MatchRequest, MatchResponse, FinishMatchRequest, MatchFilterParams, PageResponseMatch } from '../../domain/models';
import { AlertService } from '@app/core/services/alert.service';

/**
 * Match Service (Application Layer)
 *
 * Orchestrates match business logic and state management
 * Converts DTOs to domain models and handles UI feedback
 *
 * Features:
 * - Reactive state with signals
 * - Domain model conversion
 * - Error handling with SweetAlert2
 * - Loading states management
 */
@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private readonly matchApi = inject(MatchApiService);
  private readonly alertService = inject(AlertService);

  // State management with signals
  private readonly matchesSignal = signal<Match[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly selectedMatchSignal = signal<Match | null>(null);
  private readonly paginationSignal = signal<Omit<PageResponseMatch, 'content'>>({
    page: 0,
    size: 15,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false
  });

  // Public readonly signals
  readonly matches = this.matchesSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly selectedMatch = this.selectedMatchSignal.asReadonly();
  readonly pagination = this.paginationSignal.asReadonly();

  /**
   * Load matches for a tournament with optional filters
   */
  loadMatches(tournamentId: number, filters?: MatchFilterParams): void {
    this.loadingSignal.set(true);

    this.matchApi.getMatchesByTournament(tournamentId, filters)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (response) => {
          const matches = response.content.map(r => this.mapToDomain(r));
          this.matchesSignal.set(matches);

          const { content, ...paginationInfo } = response;
          this.paginationSignal.set(paginationInfo);
        },
        error: (error) => {
          console.error('Error loading matches:', error);
          this.alertService.error('No se pudieron cargar los partidos. Por favor, intenta de nuevo.');
        }
      });
  }

  /**
   * Create a new match
   */
  createMatch(tournamentId: number, request: MatchRequest): void {
    this.loadingSignal.set(true);

    this.matchApi.createMatch(tournamentId, request)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (response) => {
          const newMatch = this.mapToDomain(response);
          this.matchesSignal.update(matches => [...matches, newMatch]);
          this.alertService.success('El partido se creó exitosamente.', '¡Partido creado!');
        },
        error: (error) => {
          console.error('Error creating match:', error);
          const errorMessage = error.error?.message || 'No se pudo crear el partido.';
          this.alertService.error(errorMessage);
        }
      });
  }

  /**
   * Update match details
   */
  updateMatch(tournamentId: number, matchId: number, request: MatchRequest): void {
    this.loadingSignal.set(true);

    this.matchApi.updateMatch(tournamentId, matchId, request)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (response) => {
          const updatedMatch = this.mapToDomain(response);
          this.matchesSignal.update(matches =>
            matches.map(m => m.id === matchId ? updatedMatch : m)
          );
          this.alertService.success('El partido se actualizó exitosamente.', '¡Partido actualizado!');
        },
        error: (error) => {
          console.error('Error updating match:', error);
          const errorMessage = error.error?.message || 'No se pudo actualizar el partido.';
          this.alertService.error(errorMessage);
        }
      });
  }

  /**
   * Delete match
   */
  async deleteMatch(tournamentId: number, matchId: number): Promise<void> {
    const confirmed = await this.alertService.confirm({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmed) return;

    this.loadingSignal.set(true);

    this.matchApi.deleteMatch(tournamentId, matchId)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: () => {
          this.matchesSignal.update(matches => matches.filter(m => m.id !== matchId));
          this.alertService.success('El partido se eliminó exitosamente.', '¡Eliminado!');
        },
        error: (error) => {
          console.error('Error deleting match:', error);
          const errorMessage = error.error?.message || 'No se pudo eliminar el partido.';
          this.alertService.error(errorMessage);
        }
      });
  }

  /**
   * Finish match and set result
   * Can be used to update scores even for finished matches
   */
  finishMatch(tournamentId: number, matchId: number, request: FinishMatchRequest): void {
    this.loadingSignal.set(true);

    this.matchApi.finishMatch(tournamentId, matchId, request)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (response) => {
          const updatedMatch = this.mapToDomain(response);
          this.matchesSignal.update(matches =>
            matches.map(m => m.id === matchId ? updatedMatch : m)
          );
          this.alertService.success('El resultado del partido se guardó exitosamente.', '¡Resultado guardado!');
        },
        error: (error) => {
          console.error('Error finishing match:', error);
          const errorMessage = error.error?.message || 'No se pudo guardar el resultado.';
          this.alertService.error(errorMessage);
        }
      });
  }

  /**
   * Postpone match
   */
  async postponeMatch(tournamentId: number, matchId: number): Promise<void> {
    const confirmed = await this.alertService.confirm({
      title: '¿Posponer partido?',
      text: 'El partido quedará marcado como pospuesto',
      confirmButtonText: 'Sí, posponer',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmed) return;

    this.loadingSignal.set(true);

    this.matchApi.postponeMatch(tournamentId, matchId)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (response) => {
          const updatedMatch = this.mapToDomain(response);
          this.matchesSignal.update(matches =>
            matches.map(m => m.id === matchId ? updatedMatch : m)
          );
          this.alertService.success('El partido se pospuso exitosamente.', '¡Partido pospuesto!');
        },
        error: (error) => {
          console.error('Error postponing match:', error);
          const errorMessage = error.error?.message || 'No se pudo posponer el partido.';
          this.alertService.error(errorMessage);
        }
      });
  }

  /**
   * Select a match for viewing details
   */
  selectMatch(match: Match | null): void {
    this.selectedMatchSignal.set(match);
  }

  /**
   * Maps DTO to domain model
   */
  private mapToDomain(response: MatchResponse): Match {
    return new Match(
      response.id,
      response.tournamentId,
      response.homeTeamId,
      response.awayTeamId,
      response.homeTeamScore,
      response.awayTeamScore,
      new Date(response.matchDate),
      response.field,
      response.status
    );
  }
}
