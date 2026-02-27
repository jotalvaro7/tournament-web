import { Component, inject, computed, input, linkedSignal } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentFormModalComponent } from './presentation/components/tournament-form-modal/tournament-form-modal.component';
import { TournamentManageComponent } from './presentation/components/tournament-manage/tournament-manage.component';
import { TournamentService } from './application/services';
import { TournamentRequestDto } from './domain/models';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [TournamentFormModalComponent, TournamentManageComponent],
  templateUrl: './tournaments.component.html',
})
export class TournamentsComponent {
  id = input.required<string>();

  private readonly router = inject(Router);
  private readonly tournamentService = inject(TournamentService);

  readonly mode = computed(() => this.id() === 'new' ? 'list' : 'manage');

  readonly showCreateModal = linkedSignal(() => this.id() === 'new');

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  async onCreateSave(request: TournamentRequestDto): Promise<void> {
    const tournament = await this.tournamentService.create(request);
    this.showCreateModal.set(false);
    this.router.navigate(['/tournaments', tournament.id]);
  }

  onCreateClose(): void {
    this.showCreateModal.set(false);
    if (this.id() === 'new') {
      this.router.navigate(['/tournaments']);
    }
  }
}
