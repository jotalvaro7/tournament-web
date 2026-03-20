import { Component, input, output, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Team } from '../../../domain/models';
import { Match, MatchStatus } from '@app/features/matches/domain/models';

@Component({
  selector: 'app-team-matches-modal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './team-matches-modal.component.html'
})
export class TeamMatchesModalComponent {
  readonly team = input<Team | null>(null);
  readonly matches = input<Match[]>([]);
  readonly teams = input<Team[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly close = output<void>();
  readonly viewMatch = output<Match>();

  readonly hasMatches = computed(() => this.matches().length > 0);

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(): void {
    this.close.emit();
  }

  onMatchClick(match: Match): void {
    this.viewMatch.emit(match);
  }

  getHomeTeamName(match: Match): string {
    const team = this.teams().find(t => t.id === match.homeTeamId);
    return team?.name ?? 'Home';
  }

  getAwayTeamName(match: Match): string {
    const team = this.teams().find(t => t.id === match.awayTeamId);
    return team?.name ?? 'Away';
  }

  isHomeMatch(match: Match): boolean {
    return match.homeTeamId === this.team()?.id;
  }

  private getMatchResult(match: Match): 'win' | 'draw' | 'loss' | null {
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

  getResultDisplay(match: Match): { label: string; color: string } | null {
    const result = this.getMatchResult(match);
    if (!result) return null;
    const display: Record<'win' | 'draw' | 'loss', { label: string; color: string }> = {
      win:  { label: 'Win',  color: 'bg-emerald-100 text-emerald-700' },
      draw: { label: 'Draw', color: 'bg-amber-100 text-amber-700' },
      loss: { label: 'Loss', color: 'bg-red-100 text-red-700' },
    };
    return display[result];
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
