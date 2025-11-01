import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TournamentService } from '../../../application/services';
import { Tournament, TournamentHelper, TournamentRequestDto } from '../../../domain/models';
import { TournamentFormComponent } from '../tournament-form/tournament-form.component';
import { TournamentActionsComponent } from '../tournament-actions/tournament-actions.component';

/**
 * Tournament Manage Component
 *
 * Displays tournament information and management actions.
 * Allows viewing, editing, and changing tournament state.
 *
 * Features:
 * - Display tournament details (name, description, status)
 * - Status badge with color coding
 * - Action buttons: Edit, Start, End, Cancel, Delete
 * - Inline edit mode with TournamentForm
 * - Reactive to route parameter changes (reloads when switching tournaments)
 * - OnPush change detection for performance
 */
@Component({
  selector: 'app-tournament-manage',
  standalone: true,
  imports: [TournamentFormComponent, TournamentActionsComponent],
  templateUrl: './tournament-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentManageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly tournamentService = inject(TournamentService);
  private paramSubscription?: Subscription;

  /**
   * Currently selected tournament
   */
  readonly tournament = signal<Tournament | null>(null);

  /**
   * Loading state
   */
  readonly isLoading = signal(false);

  /**
   * Edit mode toggle
   */
  readonly isEditMode = signal(false);

  /**
   * Helper class for UI utilities
   */
  readonly helper = TournamentHelper;

  ngOnInit(): void {
    // Subscribe to route parameter changes
    // This ensures the component reloads when switching between tournaments
    this.paramSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      // Reset edit mode when switching tournaments
      this.isEditMode.set(false);

      if (id && id !== 'new') {
        this.loadTournament(Number(id));
      } else {
        this.tournament.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    this.paramSubscription?.unsubscribe();
  }

  /**
   * Loads tournament by ID
   */
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

  /**
   * Enables edit mode
   */
  onEdit(): void {
    this.isEditMode.set(true);
  }

  /**
   * Handles save from form
   */
  onSave(request: TournamentRequestDto): void {
    const tournament = this.tournament();
    if (!tournament) return;

    this.tournamentService.update(tournament.id, request).subscribe({
      next: (updated) => {
        this.tournament.set(updated);
        this.isEditMode.set(false);
      }
    });
  }

  /**
   * Handles cancel from form
   */
  onCancelEdit(): void {
    this.isEditMode.set(false);
  }

  /**
   * Starts the tournament
   */
  onStart(): void {
    const tournament = this.tournament();
    if (!tournament) return;

    this.tournamentService.start(tournament).then(() => {
      this.loadTournament(tournament.id);
    });
  }

  /**
   * Ends the tournament
   */
  onEnd(): void {
    const tournament = this.tournament();
    if (!tournament) return;

    this.tournamentService.end(tournament).then(() => {
      this.loadTournament(tournament.id);
    });
  }

  /**
   * Cancels the tournament
   */
  onCancel(): void {
    const tournament = this.tournament();
    if (!tournament) return;

    this.tournamentService.cancel(tournament).then(() => {
      this.loadTournament(tournament.id);
    });
  }

  /**
   * Deletes the tournament
   */
  onDelete(): void {
    const tournament = this.tournament();
    if (!tournament) return;

    this.tournamentService.delete(tournament);
  }
}
