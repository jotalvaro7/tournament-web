import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, firstValueFrom } from 'rxjs';
import { PlayerApiService } from '../../infrastructure/player-api.service';
import { Player, PlayerRequestDto, PlayerHelper } from '../../domain/models';
import { AlertService } from '@app/core/services';

/**
 * Player Service (Application Layer - Facade)
 *
 * Coordinates player operations and manages UI state.
 * Acts as a facade between UI components and infrastructure services.
 *
 * Important: Business validations are handled by the backend.
 * Error interceptor automatically displays errors to the user.
 */
@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private readonly api = inject(PlayerApiService);
  private readonly alert = inject(AlertService);

  /** Current team context */
  private currentTournamentId = 0;
  private currentTeamId = 0;

  /** Signal holding the list of players for current team */
  readonly players = signal<Player[]>([]);

  /** Signal indicating if data is being loaded */
  readonly isLoading = signal(false);

  /**
   * Loads all players for a specific team
   */
  loadPlayersByTeam(tournamentId: number, teamId: number): void {
    this.currentTournamentId = tournamentId;
    this.currentTeamId = teamId;
    this.isLoading.set(true);

    this.api.getAllByTeam(tournamentId, teamId)
      .pipe(
        tap({
          next: (players) => {
            this.players.set(players);
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
   * Creates a new player in the current team
   */
  create(request: PlayerRequestDto): Observable<Player> {
    return this.api.create(this.currentTournamentId, this.currentTeamId, request).pipe(
      tap({
        next: (player) => {
          this.alert.success(`Player "${PlayerHelper.getFullName(player)}" created successfully!`);
          this.refreshPlayers();
        }
      })
    );
  }

  /**
   * Updates an existing player
   */
  update(playerId: number, request: PlayerRequestDto): Observable<Player> {
    return this.api.update(this.currentTournamentId, this.currentTeamId, playerId, request).pipe(
      tap({
        next: (player) => {
          this.alert.success(`Player "${PlayerHelper.getFullName(player)}" updated successfully!`);
          this.refreshPlayers();
        }
      })
    );
  }

  /**
   * Deletes a player with confirmation
   */
  async delete(player: Player): Promise<void> {
    const confirmed = await this.alert.confirm({
      title: 'Delete Player?',
      text: `Are you sure you want to delete "${PlayerHelper.getFullName(player)}"? This action cannot be undone.`,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (!confirmed) return;

    await firstValueFrom(
      this.api.delete(this.currentTournamentId, this.currentTeamId, player.id).pipe(
        tap({
          next: () => {
            this.alert.success(`Player "${PlayerHelper.getFullName(player)}" deleted successfully!`);
            this.refreshPlayers();
          }
        })
      )
    );
  }

  /**
   * Clears the players signal
   */
  clearPlayers(): void {
    this.players.set([]);
    this.currentTournamentId = 0;
    this.currentTeamId = 0;
  }

  /**
   * Refreshes the current players list
   */
  private refreshPlayers(): void {
    if (this.currentTournamentId && this.currentTeamId) {
      this.loadPlayersByTeam(this.currentTournamentId, this.currentTeamId);
    }
  }
}