import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from '../../../application/services';
import { Player, PlayerRequestDto, PlayerHelper } from '../../../domain/models';
import { PlayerFormModalComponent } from '../player-form-modal/player-form-modal.component';
import { TeamService } from '@app/features/teams/application/services';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [PlayerFormModalComponent],
  templateUrl: './player-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerListComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly playerService = inject(PlayerService);
  private readonly teamService = inject(TeamService);

  readonly tournamentId = signal<number | null>(null);
  readonly teamId = signal<number | null>(null);
  readonly teamName = signal<string>('');
  readonly players = this.playerService.players;
  readonly isLoading = this.playerService.isLoading;
  readonly showFormModal = signal(false);
  readonly editingPlayer = signal<Player | null>(null);
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
    this.showFormModal.set(true);
  }

  onEditPlayer(player: Player): void {
    this.editingPlayer.set(player);
    this.showFormModal.set(true);
  }

  onDeletePlayer(player: Player): void {
    this.playerService.delete(player);
  }

  onSavePlayer(request: PlayerRequestDto): void {
    const editingPlayer = this.editingPlayer();

    if (editingPlayer) {
      this.playerService.update(editingPlayer.id, request).subscribe({
        next: () => {
          this.showFormModal.set(false);
          this.editingPlayer.set(null);
        }
      });
    } else {
      this.playerService.create(request).subscribe({
        next: () => {
          this.showFormModal.set(false);
        }
      });
    }
  }

  onCloseFormModal(): void {
    this.showFormModal.set(false);
    this.editingPlayer.set(null);
  }
}