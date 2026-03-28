import { Injectable, Signal, inject } from '@angular/core';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { TeamApiService } from '../../infrastructure/team-api.service';
import { Team, TeamRequestDto } from '../../domain/models';
import { AlertService } from '@app/core/services';

/**
 * Team Service (Application Layer - Facade)
 *
 * Coordinates team operations and manages UI state.
 * Acts as a facade between UI components and infrastructure services.
 *
 * Responsibilities:
 * - Orchestrate API calls
 * - Manage reactive state (signals)
 * - Handle UX confirmations
 * - Show success notifications
 * - Refresh data after mutations
 *
 * Important: Business validations are handled by the backend.
 * The backend will return appropriate errors if operations are invalid.
 * Error interceptor automatically displays these errors to the user.
 *
 * Architecture: Facade Pattern
 * Components → TeamService (facade) → TeamApiService (adapter) → Backend
 */
@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly api = inject(TeamApiService);
  private readonly alert = inject(AlertService);

  /**
  * Get all teams by Tournament
  */
  loadTeamsByTournament(tournamentId: Signal<number | null>) {
    return this.api.getAllByTournamentResource(tournamentId);
  }

  /**
   * Loads a team by ID as a reactive resource
   */
  loadTeam(tournamentId: Signal<number | null>, teamId: Signal<number | null>) {
    return this.api.getByIdResource(tournamentId, teamId);
  }

  /**
   * Creates a new team in a tournament
   */
  create(tournamentId: number, request: TeamRequestDto): Observable<Team> {
    return this.api.create(tournamentId, request).pipe(
      tap((team) => {
        this.alert.success(`Equipo "${team.name}" creado con éxito!`);
      })
    );
  }

  /**
   * Updates an existing team
   */
  update(tournamentId: number, teamId: number, request: TeamRequestDto): Observable<Team> {
    return this.api.update(tournamentId, teamId, request).pipe(
      tap((team) => {
        this.alert.success(`Equipo "${team.name}" actualizado con éxito!`);
      })
    );
  }

  /**
   * Deletes a team from a tournament
   * Shows confirmation dialog before deletion
   */
  
  async delete(tournamentId: number, team: Team): Promise<boolean> {
    const confirmed = await this.alert.confirm({
      title: 'Eliminar Equipo?',
      text: `Esta seguro que desea eliminar "${team.name}"?.`,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmed) return false;

    await firstValueFrom(this.api.delete(tournamentId, team.id));
    this.alert.success(`Equipo "${team.name}" eliminado con éxito!`);
    return true;
  }

  /**
   * Loads standings (teams sorted by points and goal difference) for a tournament
   */
  loadStandings(tournamentId: Signal<number | null>) {
    return this.api.getStandingsResource(tournamentId);
  }

  /**
   * Loads all matches played by a specific team
   */
  loadMatchesByTeam(tournamentId: Signal<number | null>, teamId:Signal<number | null>) {
    return this.api.getMatchesByTeamResource(tournamentId, teamId);
  }

}
