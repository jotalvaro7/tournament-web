import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TournamentFormModalComponent } from './presentation/components/tournament-form-modal/tournament-form-modal.component';
import { TournamentManageComponent } from './presentation/components/tournament-manage/tournament-manage.component';
import { TournamentService } from './application/services';
import { TournamentRequestDto } from './domain/models';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [RouterLink, TournamentFormModalComponent, TournamentManageComponent],
  templateUrl: './tournaments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tournamentService = inject(TournamentService);
  private paramSubscription?: Subscription;

  readonly mode = signal<'list' | 'manage'>('list');
  readonly showCreateModal = signal(false);

  ngOnInit(): void {
    this.paramSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id === 'new') {
        this.mode.set('list');
        this.showCreateModal.set(true);
      } else if (id) {
        this.mode.set('manage');
        this.showCreateModal.set(false);
      } else {
        this.mode.set('list');
      }
    });
  }

  ngOnDestroy(): void {
    this.paramSubscription?.unsubscribe();
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
