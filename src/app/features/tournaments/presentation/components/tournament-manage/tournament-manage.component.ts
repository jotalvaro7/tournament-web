import { Component, signal, inject, computed, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TournamentService } from '../../../application/services';
import { Tournament, TournamentHelper, TournamentRequestDto } from '../../../domain/models';
import { TournamentFormModalComponent } from '../tournament-form-modal/tournament-form-modal.component';
import { TournamentActionsComponent } from '../tournament-actions/tournament-actions.component';

@Component({
  selector: 'app-tournament-manage',
  standalone: true,
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

  private loadTournament(id: number): void {
    this.isLoading.set(true);
    this.tournamentService.getById(id).subscribe({
      next: (tournament) => {
        this.tournament.set(tournament);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onEdit(): void {
    this.showEditModal.set(true);
  }

  onSave(request: TournamentRequestDto): void {
    const tournament = this.tournament();
    if (!tournament) return;

    this.tournamentService.update(tournament.id, request).subscribe({
      next: (updated) => {
        this.tournament.set(updated);
        this.showEditModal.set(false);
      }
    });
  }

  onCloseModal(): void {
    this.showEditModal.set(false);
  }

  onStart(): void {
    const tournament = this.tournament();
    if (!tournament) return;

    this.tournamentService.start(tournament).then(() => {
      this.loadTournament(tournament.id);
    });
  }

  onEnd(): void {
    const tournament = this.tournament();
    if (!tournament) return;

    this.tournamentService.end(tournament).then(() => {
      this.loadTournament(tournament.id);
    });
  }

  onCancel(): void {
    const tournament = this.tournament();
    if (!tournament) return;

    this.tournamentService.cancel(tournament).then(() => {
      this.loadTournament(tournament.id);
    });
  }

  onDelete(): void {
    const tournament = this.tournament();
    if (!tournament) return;

    this.tournamentService.delete(tournament);
  }
}