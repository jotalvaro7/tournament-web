import { Component, signal, inject, computed, input } from '@angular/core';
import { TeamService } from '../../../application/services';
import { AuthService } from '@app/features/auth/application/services';
import { Team, TeamRequestDto } from '../../../domain/models';
import { TeamFormModalComponent } from '../team-form-modal/team-form-modal.component';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [TeamFormModalComponent],
  templateUrl: './team-list.component.html'
})
export class TeamListComponent {
  readonly id = input<string>('');

  private readonly teamService = inject(TeamService);
  readonly isAdmin = inject(AuthService).isAdmin;

  readonly tournamentId = computed(() => Number(this.id()) || null);

  readonly showFormModal = signal(false);
  readonly editingTeam = signal<Team | null>(null);

  private readonly teamListResource = this.teamService.loadTeamsByTournament(this.tournamentId);

  readonly teams = computed(() => this.teamListResource.value() ?? []);
  readonly isLoading = computed(() => this.teamListResource.isLoading());

  onAddTeam(): void {
    this.editingTeam.set(null);
    this.showFormModal.set(true);
  }

  onEditTeam(team: Team): void {
    this.editingTeam.set(team);
    this.showFormModal.set(true);
  }

  onSaveTeam(request: TeamRequestDto): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    const editingTeam = this.editingTeam();
    if (editingTeam) {
      this.teamService.update(tournamentId, editingTeam.id, request).subscribe({
        next: () => {
          this.showFormModal.set(false);
          this.editingTeam.set(null);
          this.teamListResource.reload();
        }
      });
    } else {
      this.teamService.create(tournamentId, request).subscribe({
        next: () => {
          this.showFormModal.set(false);
          this.teamListResource.reload();
        }
      });
    }
  }

  onCloseFormModal(): void {
    this.showFormModal.set(false);
    this.editingTeam.set(null);
  }

  async onRemoveTeam(team: Team): Promise<void> {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;
    const deleted = await this.teamService.delete(tournamentId, team);
    if (deleted) this.teamListResource.reload();
  }
}
