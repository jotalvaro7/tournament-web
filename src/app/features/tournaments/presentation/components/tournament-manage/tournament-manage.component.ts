import { Component, signal, inject, computed, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TournamentService } from '../../../application/services';
import { Tournament, TournamentHelper, TournamentRequestDto } from '../../../domain/models';
import { TournamentFormModalComponent } from '../tournament-form-modal/tournament-form-modal.component';
import { TournamentActionsComponent } from '../tournament-actions/tournament-actions.component';

@Component({
  selector: 'app-tournament-manage',
  imports: [TournamentFormModalComponent, TournamentActionsComponent],
  templateUrl: './tournament-manage.component.html'
})
export class TournamentManageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly tournamentService = inject(TournamentService);

  private readonly params = toSignal(this.route.paramMap);

  readonly tournamentId = computed(() => {
    const id = this.params()?.get('id');
    return id && id !== 'new' ? Number(id) : null;
  });

  readonly tournament = signal<Tournament | null>(null);
  readonly isLoading = signal(false);
  readonly showEditModal = signal(false);
  readonly helper = TournamentHelper;

  constructor() {
    effect(() => {
      const id = this.tournamentId();
      this.showEditModal.set(false);

      if (id) {
        this.loadTournament(id);
      } else {
        this.tournament.set(null);
      }
    });
  }

  private async loadTournament(id: number): Promise<void> {
    this.isLoading.set(true);
    const tournamentById = await this.tournamentService.getById(id);
    this.tournament.set(tournamentById);
    this.isLoading.set(false);
  }

  onEdit(): void {
    this.showEditModal.set(true);
  }

  async onSave(request: TournamentRequestDto): Promise<void> {
    const tournament = this.tournament();
    if (!tournament) return;

    const updated = await this.tournamentService.update(tournament.id, request);
    this.tournament.set(updated);
    this.showEditModal.set(false);
  }

  onCloseModal(): void {
    this.showEditModal.set(false);
  }

  async onStart(): Promise<void> {
    const tournament = this.tournament();
    if (!tournament) return;

    await this.tournamentService.start(tournament);
    await this.loadTournament(tournament.id);
  }

  async onEnd(): Promise<void> {
    const tournament = this.tournament();
    if (!tournament) return;

    await this.tournamentService.end(tournament);
    await this.loadTournament(tournament.id);
  }

  async onCancel(): Promise<void> {
    const tournament = this.tournament();
    if (!tournament) return;

    await this.tournamentService.cancel(tournament);
    await this.loadTournament(tournament.id);
  }

  onDelete(): void {
    const tournament = this.tournament();
    if (!tournament) return;

    this.tournamentService.delete(tournament);
  }
}