import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TournamentFormComponent } from './presentation/components/tournament-form/tournament-form.component';
import { TournamentManageComponent } from './presentation/components/tournament-manage/tournament-manage.component';
import { TournamentService } from './application/services';
import { TournamentRequestDto } from './domain/models';

/**
 * Tournaments Component
 *
 * Main container component for tournament management.
 * Handles routing for:
 * - /tournaments (default view)
 * - /tournaments/new (create new tournament)
 * - /tournaments/:id (manage existing tournament)
 *
 * Reacts to route parameter changes to switch between modes.
 */
@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [RouterLink, TournamentFormComponent, TournamentManageComponent],
  templateUrl: './tournaments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tournamentService = inject(TournamentService);
  private paramSubscription?: Subscription;

  /**
   * Current mode: 'list' | 'new' | 'manage'
   */
  readonly mode = signal<'list' | 'new' | 'manage'>('list');

  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.paramSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id === 'new') {
        this.mode.set('new');
      } else if (id) {
        this.mode.set('manage');
      } else {
        this.mode.set('list');
      }
    });
  }

  ngOnDestroy(): void {
    this.paramSubscription?.unsubscribe();
  }

  /**
   * Handles save from create form
   */
  onCreateSave(request: TournamentRequestDto): void {
    this.tournamentService.create(request).subscribe({
      next: (tournament) => {
        // Navigate to the newly created tournament
        this.router.navigate(['/tournaments', tournament.id]);
      }
    });
  }

  /**
   * Handles cancel from create form
   */
  onCreateCancel(): void {
    this.router.navigate(['/tournaments']);
  }
}
