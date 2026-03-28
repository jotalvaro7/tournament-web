import { Injectable, inject, computed, Signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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

  private readonly tournamentsResource = this.api.getAllResource();

  /** Reactive list of all tournaments. Auto-fetches on service creation. */
  readonly tournaments = computed(() => this.tournamentsResource.value() ?? []);

  /** Loading state of the tournaments list */
  readonly isLoading = this.tournamentsResource.isLoading;

  /**
   * Creates a reactive resource for a tournament by ID.
   * Automatically re-fetches when the ID signal changes.
   * Returns undefined when ID is null (no fetch).
   */
  getTournamentByIdResource(id: Signal<number | null>) {
    return this.api.getByIdResource(id);
  }

  /**
   * Creates a new tournament
   */
  async create(request: TournamentRequestDto): Promise<Tournament> {
    const tournament = await firstValueFrom(this.api.create(request));
    this.alert.success(`Torneo "${tournament.name}" creado con éxito!`);
    this.tournamentsResource.reload();
    return tournament;
  }

  /**
   * Updates an existing tournament
   */
  async update(id: number, request: TournamentRequestDto): Promise<Tournament> {
    const tournament = await firstValueFrom(this.api.update(id, request));
    this.alert.success(`Torneo "${tournament.name}" actualizado con éxito!`);
    this.tournamentsResource.reload();
    return tournament;
  }

  /**
   * Deletes a tournament
   * Backend validates if deletion is allowed based on tournament status
   */
  async delete(tournament: Tournament): Promise<void> {
    const confirmed = await this.alert.confirm({
      title: 'Eliminar Torneo?',
      text: `Esta seguro que desea eliminar el torneo "${tournament.name}"?.`,
      confirmButtonText: 'Si, confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmed) return;

    await firstValueFrom(this.api.delete(tournament.id));
    this.alert.success(`Torneo "${tournament.name}" eliminado con éxito!`);
    this.tournamentsResource.reload();
  }

  /**
   * Starts a tournament
   * Backend validates if tournament can be started (CREATED → IN_PROGRESS)
   */
  async start(tournament: Tournament): Promise<void> {
    const confirmed = await this.alert.confirm({
      title: 'Iniciar Torneo?',
      text: `Iniciar torneo "${tournament.name}"?`,
      confirmButtonText: 'Si, iniciar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmed) return;

    const updated = await firstValueFrom(this.api.start(tournament.id));
    this.alert.success(`Torneo "${updated.name}" iniciado con éxito!`);
  }

  /**
   * Ends a tournament
   * Backend validates if tournament can be ended (IN_PROGRESS → COMPLETED)
   */
  async end(tournament: Tournament): Promise<void> {
    const confirmed = await this.alert.confirm({
      title: 'Finalizar Torneo?',
      text: `Finalizar torneo "${tournament.name}"?`,
      confirmButtonText: 'Si, finalizar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmed) return;

    const updated = await firstValueFrom(this.api.end(tournament.id));
    this.alert.success(`Torneo "${updated.name}" finalizado con éxito!`);
  }

  /**
   * Cancels a tournament
   * Backend validates if tournament can be cancelled (any state except COMPLETED → CANCELLED)
   */
  async cancel(tournament: Tournament): Promise<void> {
    const confirmed = await this.alert.confirm({
      title: 'Cancelar Torneo?',
      text: `Estas seguro que deseas cancelar "${tournament.name}"?`,
      confirmButtonText: 'Si, confirmar',
      cancelButtonText: 'No, olvidalo'
    });

    if (!confirmed) return;

    const updated = await firstValueFrom(this.api.cancel(tournament.id));
    this.alert.success(`Torneo "${updated.name}" cancelado con éxito!`);
  }
}
