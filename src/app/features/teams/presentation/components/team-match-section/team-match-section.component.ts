import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TeamService } from '../../../application/services';
import { Team } from '../../../domain/models';
import { Match, MatchRequest, FinishMatchRequest } from '@app/features/matches/domain/models';
import { MatchService } from '@app/features/matches/application/services';
import { TeamMatchesModalComponent } from '../team-matches-modal/team-matches-modal.component';
import { MatchDetailsModalComponent } from '@app/features/matches/presentation/components/match-details-modal/match-details-modal.component';
import { MatchFormModalComponent } from '@app/features/matches/presentation/components/match-form-modal/match-form-modal.component';
import { MatchResultModalComponent } from '@app/features/matches/presentation/components/match-result-modal/match-result-modal.component';

@Component({
  selector: 'app-team-match-section',
  standalone: true,
  imports: [TeamMatchesModalComponent, MatchDetailsModalComponent, MatchFormModalComponent, MatchResultModalComponent],
  templateUrl: './team-match-section.component.html'
})
export class TeamMatchSectionComponent {
  readonly tournamentId = input<number | null>(null);
  readonly teams = input<Team[]>([]);
  readonly selectedTeam = input<Team | null>(null);
  readonly closeMatches = output<void>();

  private readonly matchService = inject(MatchService);
  private readonly teamService = inject(TeamService);

  readonly selectedMatchForDetails = signal<Match | null>(null);
  readonly editingMatch = signal<Match | null>(null);
  readonly matchForResult = signal<Match | null>(null);

  private readonly teamMatchesResource = this.teamService.loadMatchesByTeam(
    this.tournamentId,
    computed(() => this.selectedTeam()?.id ?? null)
  );

  readonly teamMatches = computed(() => this.teamMatchesResource.value() ?? []);
  readonly isLoadingMatches = computed(() => this.teamMatchesResource.isLoading());

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
