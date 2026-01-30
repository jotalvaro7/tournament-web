import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../../application/services';
import { Team, TeamRequestDto } from '../../../domain/models';
import { TeamFormModalComponent } from '../team-form-modal/team-form-modal.component';
import { TeamDetailsModalComponent } from '../team-details-modal/team-details-modal.component';
import { TeamMatchesModalComponent } from '../team-matches-modal/team-matches-modal.component';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [TeamFormModalComponent, TeamDetailsModalComponent, TeamMatchesModalComponent],
  templateUrl: './team-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamListComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly teamService = inject(TeamService);

  readonly tournamentId = signal<number | null>(null);
  readonly teams = this.teamService.teams;
  readonly isLoading = this.teamService.isLoading;
  readonly showFormModal = signal(false);
  readonly editingTeam = signal<Team | null>(null);
  readonly selectedTeamForModal = signal<Team | null>(null);
  readonly selectedTeamForMatches = signal<Team | null>(null);
  readonly teamMatches = this.teamService.teamMatches;
  readonly isLoadingMatches = this.teamService.isLoadingMatches;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const tournamentId = Number(id);
      this.tournamentId.set(tournamentId);
      this.teamService.loadTeamsByTournament(tournamentId);
    }
  }

  ngOnDestroy(): void {
    this.teamService.clearTeams();
  }

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
        }
      });
    } else {
      this.teamService.create(tournamentId, request).subscribe({
        next: () => {
          this.showFormModal.set(false);
        }
      });
    }
  }

  onCloseFormModal(): void {
    this.showFormModal.set(false);
    this.editingTeam.set(null);
  }

  onRemoveTeam(team: Team): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;
    this.teamService.delete(tournamentId, team);
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

  deleteFromModal(team: Team): void {
    this.closeTeamDetails();
    this.onRemoveTeam(team);
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
      this.teamService.loadMatchesByTeam(tournamentId, team.id);
    }
  }

  closeMatchesModal(): void {
    this.selectedTeamForMatches.set(null);
    this.teamService.clearTeamMatches();
  }
}