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
   * Gets a team by ID
   */
  getById(tournamentId: number, teamId: number): Observable<Team> {
    return this.api.getById(tournamentId, teamId);
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
        this.alert.success(`Team "${team.name}" created successfully!`);
      })
    );
  }

  /**
   * Updates an existing team
   */
  update(tournamentId: number, teamId: number, request: TeamRequestDto): Observable<Team> {
    return this.api.update(tournamentId, teamId, request).pipe(
      tap((team) => {
        this.alert.success(`Team "${team.name}" updated successfully!`);
      })
    );
  }

  /**
   * Deletes a team from a tournament
   * Shows confirmation dialog before deletion
   */
  
  async delete(tournamentId: number, team: Team): Promise<boolean> {
    const confirmed = await this.alert.confirm({
      title: 'Delete Team?',
      text: `Are you sure you want to delete "${team.name}"? This action cannot be undone.`,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (!confirmed) return false;

    await firstValueFrom(this.api.delete(tournamentId, team.id));
    this.alert.success(`Team "${team.name}" deleted successfully!`);
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
