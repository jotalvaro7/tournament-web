import { Component, signal, inject, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '../../../application/services';
import { Team, TeamRequestDto } from '../../../domain/models';
import { Match, MatchRequest, FinishMatchRequest } from '@app/features/matches/domain/models';
import { MatchService } from '@app/features/matches/application/services';
import { TeamFormModalComponent } from '../team-form-modal/team-form-modal.component';
import { TeamDetailsModalComponent } from '../team-details-modal/team-details-modal.component';
import { TeamMatchesModalComponent } from '../team-matches-modal/team-matches-modal.component';
import { MatchDetailsModalComponent } from '@app/features/matches/presentation/components/match-details-modal/match-details-modal.component';
import { MatchFormModalComponent } from '@app/features/matches/presentation/components/match-form-modal/match-form-modal.component';
import { MatchResultModalComponent } from '@app/features/matches/presentation/components/match-result-modal/match-result-modal.component';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [
    TeamFormModalComponent,
    TeamDetailsModalComponent,
    TeamMatchesModalComponent,
    MatchDetailsModalComponent,
    MatchFormModalComponent,
    MatchResultModalComponent
  ],
  templateUrl: './team-list.component.html'
})
export class TeamListComponent {
  readonly id = input<string>('');

  private readonly router = inject(Router);
  private readonly teamService = inject(TeamService);
  private readonly matchService = inject(MatchService);

  readonly tournamentId = computed(() => Number(this.id()) || null);

  readonly showFormModal = signal(false);
  readonly editingTeam = signal<Team | null>(null);
  readonly selectedTeamForModal = signal<Team | null>(null);
  readonly selectedTeamForMatches = signal<Team | null>(null);
  readonly selectedMatchForDetails = signal<Match | null>(null);
  readonly editingMatch = signal<Match | null>(null);
  readonly matchForResult = signal<Match | null>(null);

  private readonly teamListResource = this.teamService.loadTeamsByTournament(this.tournamentId);
  private readonly teamMatchesResource = this.teamService.loadMatchesByTeam(
    this.tournamentId,
    computed(() => this.selectedTeamForMatches()?.id ?? null)
  );

  readonly teams = computed(() => this.teamListResource.value() ?? []);
  readonly isLoading = computed(() => this.teamListResource.isLoading());
  readonly error = computed(() => this.teamListResource.error());

  readonly teamMatches = computed(() => this.teamMatchesResource.value() ?? []);
  readonly isLoadingMatches = computed(() => this.teamMatchesResource.isLoading());


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
          this.teamListResource.reload()
        }
      });
    } else {
      this.teamService.create(tournamentId, request).subscribe({
        next: () => {
          this.showFormModal.set(false);
          this.teamListResource.reload()
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
    if(!deleted) return;
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

  viewMatchDetails(match: Match): void {
    this.selectedMatchForDetails.set(match);
  }

  closeMatchDetails(): void {
    this.selectedMatchForDetails.set(null);
  }

  getTeamName(teamId: number): string {
    const team = this.teams().find(t => t.id === teamId);
    return team?.name ?? 'Unknown';
  }

  onEditMatch(match: Match): void {
    this.editingMatch.set(match);
  }

  onCloseMatchForm(): void {
    this.editingMatch.set(null);
  }

  onSaveMatch(request: MatchRequest): void {
    const tournamentId = this.tournamentId();
    const match = this.editingMatch();
    if (!tournamentId || !match) return;

    this.matchService.updateMatch(tournamentId, match.id, request).subscribe({
      next: () => {
        this.editingMatch.set(null);
        this.teamMatchesResource.reload();
      }
    });
  }

  onFinishMatch(match: Match): void {
    this.matchForResult.set(match);
  }

  onCloseResultModal(): void {
    this.matchForResult.set(null);
  }

  onSaveResult(request: FinishMatchRequest): void {
    const tournamentId = this.tournamentId();
    const match = this.matchForResult();
    if (!tournamentId || !match) return;

    this.matchService.finishMatch(tournamentId, match.id, request).subscribe({
      next: () => {
        this.matchForResult.set(null);
        this.teamMatchesResource.reload();
      }
    });
  }

  async onPostponeMatch(match: Match): Promise<void> {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    await this.matchService.postponeMatch(tournamentId, match.id);
    this.teamMatchesResource.reload();
  }

  async onDeleteMatch(match: Match): Promise<void> {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    await this.matchService.deleteMatch(tournamentId, match.id);
    this.teamMatchesResource.reload();
  }
}