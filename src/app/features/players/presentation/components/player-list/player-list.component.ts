import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from '../../../application/services';
import { Player, PlayerRequestDto, PlayerHelper } from '../../../domain/models';
import { PlayerFormComponent } from '../player-form/player-form.component';
import { TeamService } from '@app/features/teams/application/services';

/**
 * Player List Component
 *
 * Displays players in an ultra-minimalist vertical list.
 * Allows CRUD operations for players within a team.
 */
@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [PlayerFormComponent],
  templateUrl: './player-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerListComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly playerService = inject(PlayerService);
  private readonly teamService = inject(TeamService);

  /** Route parameters */
  readonly tournamentId = signal<number | null>(null);
  readonly teamId = signal<number | null>(null);

  /** Team name for display */
  readonly teamName = signal<string>('');

  /** Players signal from service */
  readonly players = this.playerService.players;

  /** Loading state signal from service */
  readonly isLoading = this.playerService.isLoading;

  /** Signal indicating if form is shown */
  readonly showForm = signal(false);

  /** Signal holding the player being edited (null for create mode) */
  readonly editingPlayer = signal<Player | null>(null);

  /** Helper for UI utilities */
  readonly helper = PlayerHelper;

  ngOnInit(): void {
    const tournamentId = this.route.snapshot.paramMap.get('id');
    const teamId = this.route.snapshot.paramMap.get('teamId');

    if (tournamentId && teamId) {
      const tId = Number(tournamentId);
      const tmId = Number(teamId);

      this.tournamentId.set(tId);
      this.teamId.set(tmId);
      this.playerService.loadPlayersByTeam(tId, tmId);

      // Load team name for display
      this.teamService.getById(tId, tmId).subscribe({
        next: (team) => this.teamName.set(team.name)
      });
    }
  }

  ngOnDestroy(): void {
    this.playerService.clearPlayers();
  }

  onAddPlayer(): void {
    this.editingPlayer.set(null);
    this.showForm.set(true);
  }

  onEditPlayer(player: Player): void {
    this.editingPlayer.set(player);
    this.showForm.set(true);
  }

  onDeletePlayer(player: Player): void {
    this.playerService.delete(player);
  }

  onSavePlayer(request: PlayerRequestDto): void {
    const editingPlayer = this.editingPlayer();

    if (editingPlayer) {
      this.playerService.update(editingPlayer.id, request).subscribe({
        next: () => {
          this.showForm.set(false);
          this.editingPlayer.set(null);
        }
      });
    } else {
      this.playerService.create(request).subscribe({
        next: () => {
          this.showForm.set(false);
        }
      });
    }
  }

  onCancelForm(): void {
    this.showForm.set(false);
    this.editingPlayer.set(null);
  }
}