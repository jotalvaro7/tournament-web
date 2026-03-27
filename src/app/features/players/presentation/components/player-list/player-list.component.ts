import { Component, signal, inject, computed, effect, DestroyRef, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlayerService } from '../../../application/services';
import { Player, PlayerRequestDto, PlayerHelper } from '../../../domain/models';
import { PlayerFormModalComponent } from '../player-form-modal/player-form-modal.component';
import { AuthService } from '@app/features/auth/application/services';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [PlayerFormModalComponent],
  templateUrl: './player-list.component.html'
})
export class PlayerListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly playerService = inject(PlayerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

  readonly isAdmin = this.authService.isAdmin;

  readonly idInput = input<string>('');
  readonly teamIdInput = input<string>('');

  private readonly params = toSignal(this.route.paramMap);

  readonly tournamentId = computed(() => {
    const inp = this.idInput();
    if (inp) return Number(inp);
    return Number(this.params()?.get('id')) || null;
  });

  readonly teamId = computed(() => {
    const inp = this.teamIdInput();
    if (inp) return Number(inp);
    return Number(this.params()?.get('teamId')) || null;
  });

  readonly players = this.playerService.players;
  readonly isLoading = this.playerService.isLoading;
  readonly showFormModal = signal(false);
  readonly editingPlayer = signal<Player | null>(null);
  readonly helper = PlayerHelper;

  constructor() {
    effect(() => {
      const tournamentId = this.tournamentId();
      const teamId = this.teamId();

      if (tournamentId && teamId) {
        this.playerService.loadPlayersByTeam(tournamentId, teamId);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.playerService.clearPlayers();
    });
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