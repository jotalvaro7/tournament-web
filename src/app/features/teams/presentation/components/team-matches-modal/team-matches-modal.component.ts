import { Component, input, output, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Team } from '../../../domain/models';
import { MatchResponse, MatchStatus } from '@app/features/matches/domain/models';

@Component({
  selector: 'app-team-matches-modal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './team-matches-modal.component.html'
})
export class TeamMatchesModalComponent {
  team = input<Team | null>(null);
  matches = input<MatchResponse[]>([]);
  teams = input<Team[]>([]);
  isLoading = input<boolean>(false);
  close = output<void>();
  viewMatch = output<MatchResponse>();

  readonly hasMatches = computed(() => this.matches().length > 0);

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(): void {
    this.close.emit();
  }

  onMatchClick(match: MatchResponse): void {
    this.viewMatch.emit(match);
  }

  getOpponentName(match: MatchResponse): string {
    const team = this.team();
    if (!team) return '';

    const opponentId = match.homeTeamId === team.id ? match.awayTeamId : match.homeTeamId;
    const opponent = this.teams().find(t => t.id === opponentId);
    return opponent?.name ?? 'Unknown';
  }

  getHomeTeamName(match: MatchResponse): string {
    const team = this.teams().find(t => t.id === match.homeTeamId);
    return team?.name ?? 'Home';
  }

  getAwayTeamName(match: MatchResponse): string {
    const team = this.teams().find(t => t.id === match.awayTeamId);
    return team?.name ?? 'Away';
  }

  isHomeMatch(match: MatchResponse): boolean {
    return match.homeTeamId === this.team()?.id;
  }

  getMatchResult(match: MatchResponse): 'win' | 'draw' | 'loss' | null {
    if (match.status !== MatchStatus.FINISHED) return null;
    if (match.homeTeamScore === null || match.awayTeamScore === null) return null;

    const team = this.team();
    if (!team) return null;

    const isHome = match.homeTeamId === team.id;
    const teamScore = isHome ? match.homeTeamScore : match.awayTeamScore;
    const opponentScore = isHome ? match.awayTeamScore : match.homeTeamScore;

    if (teamScore > opponentScore) return 'win';
    if (teamScore < opponentScore) return 'loss';
    return 'draw';
  }

  getResultLabel(match: MatchResponse): string {
    const result = this.getMatchResult(match);
    switch (result) {
      case 'win': return 'W';
      case 'draw': return 'D';
      case 'loss': return 'L';
      default: return '-';
    }
  }

  getResultColor(match: MatchResponse): string {
    const result = this.getMatchResult(match);
    switch (result) {
      case 'win': return 'bg-emerald-100 text-emerald-700';
      case 'draw': return 'bg-amber-100 text-amber-700';
      case 'loss': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  }

  getScoreDisplay(match: MatchResponse): string {
    if (match.homeTeamScore === null || match.awayTeamScore === null) {
      return 'vs';
    }

    const team = this.team();
    if (!team) return `${match.homeTeamScore} - ${match.awayTeamScore}`;

    const isHome = match.homeTeamId === team.id;
    const teamScore = isHome ? match.homeTeamScore : match.awayTeamScore;
    const opponentScore = isHome ? match.awayTeamScore : match.homeTeamScore;

    return `${teamScore} - ${opponentScore}`;
  }

  getStatusLabel(status: MatchStatus): string {
    switch (status) {
      case MatchStatus.SCHEDULED: return 'Scheduled';
      case MatchStatus.FINISHED: return 'Finished';
      case MatchStatus.POSTPONED: return 'Postponed';
      default: return status;
    }
  }

  getStatusColor(status: MatchStatus): string {
    switch (status) {
      case MatchStatus.SCHEDULED: return 'bg-blue-100 text-blue-700';
      case MatchStatus.FINISHED: return 'bg-emerald-100 text-emerald-700';
      case MatchStatus.POSTPONED: return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  }
}
