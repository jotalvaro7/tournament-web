import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, firstValueFrom } from 'rxjs';
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
   * Signal holding the list of teams for current tournament
   * Components can read this signal reactively
   */
  readonly teams = signal<Team[]>([]);

  /**
   * Signal indicating if data is being loaded
   */
  readonly isLoading = signal(false);

  /**
   * Loads all teams for a specific tournament from API and updates signal
   */
  loadTeamsByTournament(tournamentId: number): void {
    this.isLoading.set(true);
    this.api.getAllByTournament(tournamentId)
      .pipe(
        tap({
          next: (teams) => {
            this.teams.set(teams);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
          }
        })
      )
      .subscribe();
  }

  /**
   * Gets a team by ID
   */
  getById(tournamentId: number, teamId: number): Observable<Team> {
    return this.api.getById(tournamentId, teamId);
  }

  /**
   * Creates a new team in a tournament
   */
  create(tournamentId: number, request: TeamRequestDto): Observable<Team> {
    return this.api.create(tournamentId, request).pipe(
      tap({
        next: (team) => {
          this.alert.success(`Team "${team.name}" created successfully!`);
          this.loadTeamsByTournament(tournamentId);
        }
      })
    );
  }

  /**
   * Updates an existing team
   */
  update(tournamentId: number, teamId: number, request: TeamRequestDto): Observable<Team> {
    return this.api.update(tournamentId, teamId, request).pipe(
      tap({
        next: (team) => {
          this.alert.success(`Team "${team.name}" updated successfully!`);
          this.loadTeamsByTournament(tournamentId);
        }
      })
    );
  }

  /**
   * Deletes a team from a tournament
   * Shows confirmation dialog before deletion
   */
  async delete(tournamentId: number, team: Team): Promise<void> {
    const confirmed = await this.alert.confirm({
      title: 'Delete Team?',
      text: `Are you sure you want to delete "${team.name}"? This action cannot be undone.`,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (!confirmed) {
      return;
    }

    await firstValueFrom(
      this.api.delete(tournamentId, team.id).pipe(
        tap({
          next: () => {
            this.alert.success(`Team "${team.name}" deleted successfully!`);
            this.loadTeamsByTournament(tournamentId);
          }
        })
      )
    );
  }

  /**
   * Clears the teams signal
   * Useful when navigating away from teams view
   */
  clearTeams(): void {
    this.teams.set([]);
  }
}
