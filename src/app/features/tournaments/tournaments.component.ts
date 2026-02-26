import { Component, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TournamentFormModalComponent } from './presentation/components/tournament-form-modal/tournament-form-modal.component';
import { TournamentManageComponent } from './presentation/components/tournament-manage/tournament-manage.component';
import { TournamentService } from './application/services';
import { TournamentRequestDto } from './domain/models';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [TournamentFormModalComponent, TournamentManageComponent],
  templateUrl: './tournaments.component.html'
})
export class TournamentsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tournamentService = inject(TournamentService);

  private readonly params = toSignal(this.route.paramMap);

  readonly routeId = computed(() => this.params()?.get('id') ?? null);

  readonly mode = computed(() => {
    const id = this.routeId();
    if (!id || id === 'new') return 'list';
    return 'manage';
  });

  readonly showCreateModal = signal(false);

  constructor() {
    effect(() => {
      const id = this.routeId();
      if (id === 'new') {
        this.showCreateModal.set(true);
      } else {
        this.showCreateModal.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  onCreateSave(request: TournamentRequestDto): void {
    this.tournamentService.create(request).subscribe({
      next: (tournament) => {
        this.showCreateModal.set(false);
        this.router.navigate(['/tournaments', tournament.id]);
      }
    });
  }

  onCreateClose(): void {
    this.showCreateModal.set(false);
    if (this.route.snapshot.paramMap.get('id') === 'new') {
      this.router.navigate(['/tournaments']);
    }
  }
}
