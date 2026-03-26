import { Component, computed, inject, input, signal } from '@angular/core';
import { TeamService } from '../../../application/services';
import { MatchService } from '@app/features/matches/application/services';
import { AuthService } from '@app/features/auth/application/services';
import { Match, FinishMatchRequest } from '@app/features/matches/domain/models';
import { MatchResultModalComponent } from '@app/features/matches/presentation/components/match-result-modal/match-result-modal.component';

@Component({
  selector: 'app-team-results',
  standalone: true,
  imports: [MatchResultModalComponent],
  templateUrl: './team-results.component.html'
})
export class TeamResultsComponent {
  readonly id = input<string>('');
  readonly teamId = input<string>('');

  private readonly teamService = inject(TeamService);
  private readonly matchService = inject(MatchService);

  readonly isAdmin = inject(AuthService).isAdmin;

  private readonly tournamentId = computed(() => Number(this.id()) || null);
  private readonly teamIdNum = computed(() => Number(this.teamId()) || null);

  private readonly matchesResource = this.teamService.loadMatchesByTeam(this.tournamentId, this.teamIdNum);
  private readonly teamsResource = this.teamService.loadTeamsByTournament(this.tournamentId);

  readonly matches = computed(() => this.matchesResource.value() ?? []);
  readonly isLoading = this.matchesResource.isLoading;
  readonly teams = computed(() => this.teamsResource.value() ?? []);

  readonly matchForResult = signal<Match | null>(null);

  getTeamName(teamId: number): string {
    return this.teams().find(t => t.id === teamId)?.name ?? '-';
  }

  onEditResult(match: Match): void {
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
        this.matchesResource.reload();
      }
    });
  }
}
