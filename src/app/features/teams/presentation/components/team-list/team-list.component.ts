import { Component, signal, inject, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '../../../application/services';
import { AuthService } from '@app/features/auth/application/services';
import { Team, TeamRequestDto } from '../../../domain/models';
import { TeamFormModalComponent } from '../team-form-modal/team-form-modal.component';
import { TeamDetailsModalComponent } from '../team-details-modal/team-details-modal.component';
import { TeamMatchSectionComponent } from '../team-match-section/team-match-section.component';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [TeamFormModalComponent, TeamDetailsModalComponent, TeamMatchSectionComponent],
  templateUrl: './team-list.component.html'
})
export class TeamListComponent {
  readonly id = input<string>('');

  private readonly router = inject(Router);
  private readonly teamService = inject(TeamService);
  private readonly authService = inject(AuthService);

  readonly isAdmin = this.authService.isAdmin;

  readonly tournamentId = computed(() => Number(this.id()) || null);

  readonly showFormModal = signal(false);
  readonly editingTeam = signal<Team | null>(null);
  readonly selectedTeamForModal = signal<Team | null>(null);
  readonly selectedTeamForMatches = signal<Team | null>(null);

  private readonly teamListResource = this.teamService.loadTeamsByTournament(this.tournamentId);

  readonly teams = computed(() => this.teamListResource.value() ?? []);
  readonly isLoading = computed(() => this.teamListResource.isLoading());
  readonly error = computed(() => this.teamListResource.error());

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
    if (!deleted) return;
    this.closeTeamDetails();
    this.teamListResource.reload();
  }

  openTeamDetails(team: Team): void {
    this.selectedTeamForModal.set(team);
  }

  closeTeamDetails(): void {
    this.selectedTeamForModal.set(null);
  }

  editFromModal(team: Team): void {
    this.closeTeamDetails();
    this.onEditTeam(team);
  }

  viewPlayersFromModal(team: Team): void {
    this.closeTeamDetails();
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.router.navigate(['/tournaments', tournamentId, 'teams', team.id, 'players']);
    }
  }

  viewMatchesFromModal(team: Team): void {
    this.closeTeamDetails();
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.selectedTeamForMatches.set(team);
    }
  }

  closeMatchesModal(): void {
    this.selectedTeamForMatches.set(null);
  }
}
