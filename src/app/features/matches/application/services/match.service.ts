import { Injectable, Signal, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { MatchApiService } from '../../infrastructure/match-api.service';
import { Match, MatchRequest, MatchResponse, FinishMatchRequest, MatchFilterParams } from '../../domain/models';
import { AlertService } from '@app/core/services/alert.service';

/**
 * Match Service (Application Layer - Facade)
 *
 * Orchestrates match operations and delegates to the API adapter.
 *
 * Important: Business validations are handled by the backend.
 * The error interceptor automatically displays backend errors to the user.
 *
 * Architecture: Facade Pattern
 * Components → MatchService (facade) → MatchApiService (adapter) → Backend
 */
@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private readonly matchApi = inject(MatchApiService);
  private readonly alertService = inject(AlertService);

  private readonly selectedMatchSignal = signal<Match | null>(null);
  readonly selectedMatch = this.selectedMatchSignal.asReadonly();

  /**
   * Returns a reactive httpResource for paginated matches.
   * Refetches automatically when tournamentId or filters signals change.
   */
  loadMatchesByTournament(
    tournamentId: Signal<number | null>,
    filters: Signal<MatchFilterParams | undefined>
  ) {
    return this.matchApi.getMatchesByTournamentResource(tournamentId, filters);
  }

  /**
   * Create a new match
   */
  createMatch(tournamentId: number, request: MatchRequest): Observable<Match> {
    return this.matchApi.createMatch(tournamentId, request).pipe(
      map(response => this.mapToDomain(response)),
      tap(() => this.alertService.success('El partido se creó exitosamente.', '¡Partido creado!'))
    );
  }

  /**
   * Update match details
   */
  updateMatch(tournamentId: number, matchId: number, request: MatchRequest): Observable<Match> {
    return this.matchApi.updateMatch(tournamentId, matchId, request).pipe(
      map(response => this.mapToDomain(response)),
      tap(() => this.alertService.success('El partido se actualizó exitosamente.', '¡Partido actualizado!'))
    );
  }

  /**
   * Delete match with confirmation dialog
   */
  async deleteMatch(tournamentId: number, matchId: number): Promise<void> {
    const confirmed = await this.alertService.confirm({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmed) return;

    await firstValueFrom(this.matchApi.deleteMatch(tournamentId, matchId));
    this.alertService.success('El partido se eliminó exitosamente.', '¡Eliminado!');
  }

  /**
   * Finish match and set result
   */
  finishMatch(tournamentId: number, matchId: number, request: FinishMatchRequest): Observable<Match> {
    return this.matchApi.finishMatch(tournamentId, matchId, request).pipe(
      map(response => this.mapToDomain(response)),
      tap(() => this.alertService.success('El resultado del partido se guardó exitosamente.', '¡Resultado guardado!'))
    );
  }

  /**
   * Postpone match with confirmation dialog
   */
  async postponeMatch(tournamentId: number, matchId: number): Promise<void> {
    const confirmed = await this.alertService.confirm({
      title: '¿Posponer partido?',
      text: 'El partido quedará marcado como pospuesto',
      confirmButtonText: 'Sí, posponer',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmed) return;

    await firstValueFrom(this.matchApi.postponeMatch(tournamentId, matchId));
    this.alertService.success('El partido se pospuso exitosamente.', '¡Partido pospuesto!');
  }

  /**
   * Select a match for viewing details
   */
  selectMatch(match: Match | null): void {
    this.selectedMatchSignal.set(match);
  }

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
      response.status,
      response.matchday
    );
  }
}
