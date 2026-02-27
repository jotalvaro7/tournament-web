import { Injectable, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, finalize } from 'rxjs';
import { TournamentApiService } from '../../infrastructure/tournament-api.service';
import { Tournament, TournamentRequestDto } from '../../domain/models';
import { AlertService } from '@app/core/services';

/**
 * Tournament Service (Application Layer - Facade)
 *
 * Coordinates tournament operations and manages UI state.
 * Acts as a facade between UI components and infrastructure services.
 *
 * Responsibilities:
 * - Orchestrate API calls
 * - Manage reactive state (signals)
 * - Handle UX confirmations
 * - Show success notifications
 * - Refresh data after mutations
 *
 * Important: Business validations are handled by the backend.
 * The backend will return appropriate errors (400, 404, etc.) if operations are invalid.
 * Error interceptor automatically displays these errors to the user.
 *
 * Architecture: Facade Pattern
 * Components → TournamentService (facade) → TournamentApiService (adapter) → Backend
 */
@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private readonly api = inject(TournamentApiService);
  private readonly alert = inject(AlertService);

  /**
   * Signal holding the list of tournaments
   * Components can read this signal reactively
   */
  readonly tournaments = signal<Tournament[]>([]);

  /**
   * Signal indicating if data is being loaded
   */
  readonly isLoading = signal(false);

  /**
   * Loads all tournaments from API and updates signal
   */
  loadTournaments(): void {
    this.isLoading.set(true);

    this.api.getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (tournaments) => this.tournaments.set(tournaments)
      });
  }

  /**
   * Gets a tournament by ID
   */
  async getById(id: number): Promise<Tournament> {
    return await firstValueFrom(this.api.getById(id));
  }

  /**
   * Creates a new tournament
   */
  async create(request: TournamentRequestDto): Promise<Tournament> {
    const tournament = await firstValueFrom(this.api.create(request));
    this.alert.success(`Tournament "${tournament.name}" created successfully!`);
    this.loadTournaments();
    return tournament;
  }

  /**
   * Updates an existing tournament
   */
  async update(id: number, request: TournamentRequestDto): Promise<Tournament> {
    const tournament = await firstValueFrom(this.api.update(id, request));
    this.alert.success(`Tournament "${tournament.name}" updated successfully!`);
    this.loadTournaments();
    return tournament;
  }

  /**
   * Deletes a tournament
   * Backend validates if deletion is allowed based on tournament status
   */
  async delete(tournament: Tournament): Promise<void> {
    const confirmed = await this.alert.confirm({
      title: 'Delete Tournament?',
      text: `Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (!confirmed) return;

    await firstValueFrom(this.api.delete(tournament.id));
    this.alert.success(`Tournament "${tournament.name}" deleted successfully!`);
    this.loadTournaments();
  }

  /**
   * Starts a tournament
   * Backend validates if tournament can be started (CREATED → IN_PROGRESS)
   */
  async start(tournament: Tournament): Promise<void> {
    const confirmed = await this.alert.confirm({
      title: 'Start Tournament?',
      text: `Start tournament "${tournament.name}"?`,
      confirmButtonText: 'Yes, start it',
      cancelButtonText: 'Cancel'
    });

    if (!confirmed) return;

    const updated = await firstValueFrom(this.api.start(tournament.id));
    this.alert.success(`Tournament "${updated.name}" started successfully!`);
    this.loadTournaments();
  }

  /**
   * Ends a tournament
   * Backend validates if tournament can be ended (IN_PROGRESS → COMPLETED)
   */
  async end(tournament: Tournament): Promise<void> {
    const confirmed = await this.alert.confirm({
      title: 'End Tournament?',
      text: `End tournament "${tournament.name}"?`,
      confirmButtonText: 'Yes, end it',
      cancelButtonText: 'Cancel'
    });

    if (!confirmed) return;

    const updated = await firstValueFrom(this.api.end(tournament.id));
    this.alert.success(`Tournament "${updated.name}" completed successfully!`);
    this.loadTournaments();
  }

  /**
   * Cancels a tournament
   * Backend validates if tournament can be cancelled (any state except COMPLETED → CANCELLED)
   */
  async cancel(tournament: Tournament): Promise<void> {
    const confirmed = await this.alert.confirm({
      title: 'Cancel Tournament?',
      text: `Are you sure you want to cancel "${tournament.name}"?`,
      confirmButtonText: 'Yes, cancel it',
      cancelButtonText: 'No, keep it'
    });

    if (!confirmed) return;

    const updated = await firstValueFrom(this.api.cancel(tournament.id));
    this.alert.success(`Tournament "${updated.name}" cancelled successfully!`);
    this.loadTournaments();
  }
}
