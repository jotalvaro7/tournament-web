import { Component, inject, input, computed, linkedSignal } from '@angular/core';
import { TournamentService } from '../../../application/services';
import { TournamentHelper, TournamentRequestDto } from '../../../domain/models';
import { TournamentFormModalComponent } from '../tournament-form-modal/tournament-form-modal.component';
import { TournamentActionsComponent } from '../tournament-actions/tournament-actions.component';

@Component({
  selector: 'app-tournament-manage',
  imports: [TournamentFormModalComponent, TournamentActionsComponent],
  templateUrl: './tournament-manage.component.html'
})
export class TournamentManageComponent {
  readonly id = input<string>('');

  private readonly tournamentService = inject(TournamentService);

  readonly tournamentId = computed(() => Number(this.id()) || null);

  private readonly tournamentResource = this.tournamentService.getTournamentResource(this.tournamentId);

  readonly tournament = this.tournamentResource.value;
  readonly isLoading = this.tournamentResource.isLoading;

  readonly showEditModal = linkedSignal({
    source: () => this.tournamentId(),
    computation: () => false
  });

  readonly helper = TournamentHelper;

  onEdit(): void {
    this.showEditModal.set(true);
  }

  async onSave(request: TournamentRequestDto): Promise<void> {
    const tournament = this.tournament();
    if (!tournament) return;

    await this.tournamentService.update(tournament.id, request);
    this.tournamentResource.reload();
    this.showEditModal.set(false);
  }

  onCloseModal(): void {
    this.showEditModal.set(false);
  }

  async onStart(): Promise<void> {
    const tournament = this.tournament();
    if (!tournament) return;

    await this.tournamentService.start(tournament);
    this.tournamentResource.reload();
  }

  async onEnd(): Promise<void> {
    const tournament = this.tournament();
    if (!tournament) return;

    await this.tournamentService.end(tournament);
    this.tournamentResource.reload();
  }

  async onCancel(): Promise<void> {
    const tournament = this.tournament();
    if (!tournament) return;

    await this.tournamentService.cancel(tournament);
    this.tournamentResource.reload();
  }

  onDelete(): void {
    const tournament = this.tournament();
    if (!tournament) return;

    this.tournamentService.delete(tournament);
  }
}
