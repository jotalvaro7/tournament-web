import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class TournamentManageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly tournamentService = inject(TournamentService);
  private paramSubscription?: Subscription;

  readonly tournament = signal<Tournament | null>(null);
  readonly isLoading = signal(false);
  readonly showEditModal = signal(false);
  readonly helper = TournamentHelper;

  ngOnInit(): void {
    this.paramSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.showEditModal.set(false);

      if (id && id !== 'new') {
        this.loadTournament(Number(id));
      } else {
        this.tournament.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.paramSubscription?.unsubscribe();
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