import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../../application/services';
import { Team, TeamRequestDto } from '../../../domain/models';
import { Match, MatchResponse, MatchRequest, FinishMatchRequest } from '@app/features/matches/domain/models';
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
  templateUrl: './team-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamListComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly teamService = inject(TeamService);
  private readonly matchService = inject(MatchService);

  readonly tournamentId = signal<number | null>(null);
  readonly teams = this.teamService.teams;
  readonly isLoading = this.teamService.isLoading;
  readonly showFormModal = signal(false);
  readonly editingTeam = signal<Team | null>(null);
  readonly selectedTeamForModal = signal<Team | null>(null);
  readonly selectedTeamForMatches = signal<Team | null>(null);
  readonly teamMatches = this.teamService.teamMatches;
  readonly isLoadingMatches = this.teamService.isLoadingMatches;
  readonly selectedMatchForDetails = signal<Match | null>(null);
  readonly editingMatch = signal<Match | null>(null);
  readonly matchForResult = signal<Match | null>(null);

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

  viewMatchDetails(matchResponse: MatchResponse): void {
    const match = new Match(
      matchResponse.id,
      matchResponse.tournamentId,
      matchResponse.homeTeamId,
      matchResponse.awayTeamId,
      matchResponse.homeTeamScore,
      matchResponse.awayTeamScore,
      new Date(matchResponse.matchDate),
      matchResponse.field,
      matchResponse.status
    );
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

    this.matchService.updateMatch(tournamentId, match.id, request);
    this.editingMatch.set(null);
    setTimeout(() => this.refreshTeamMatches(), 500);
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

    this.matchService.finishMatch(tournamentId, match.id, request);
    this.matchForResult.set(null);
    setTimeout(() => this.refreshTeamMatches(), 500);
  }

  async onPostponeMatch(match: Match): Promise<void> {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    await this.matchService.postponeMatch(tournamentId, match.id);
    this.refreshTeamMatches();
  }

  async onDeleteMatch(match: Match): Promise<void> {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    await this.matchService.deleteMatch(tournamentId, match.id);
    this.refreshTeamMatches();
  }

  private refreshTeamMatches(): void {
    const tournamentId = this.tournamentId();
    const team = this.selectedTeamForMatches();
    if (tournamentId && team) {
      this.teamService.loadMatchesByTeam(tournamentId, team.id);
    }
  }
}