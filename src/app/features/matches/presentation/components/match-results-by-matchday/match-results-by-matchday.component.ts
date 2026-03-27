import { Component, computed, inject, input, signal } from '@angular/core';
import { MatchService } from '../../../application/services';
import { TeamService } from '@app/features/teams/application/services';
import { Match, MatchFilterParams } from '../../../domain/models';
import { MatchdayGroup } from '../../models/matchday-group.model';

@Component({
  selector: 'app-match-results-by-matchday',
  standalone: true,
  imports: [],
  templateUrl: './match-results-by-matchday.component.html'
})
export class MatchResultsByMatchdayComponent {
  readonly id = input<string>('');

  private readonly matchService = inject(MatchService);
  private readonly teamService = inject(TeamService);

  private readonly tournamentId = computed(() => Number(this.id()) || null);
  private readonly filters = signal<MatchFilterParams>({
    sortBy: 'matchday',
    direction: 'ASC'
  });

  private readonly matchesResource = this.matchService.loadMatchesByTournament(this.tournamentId,this.filters);
  private readonly teamsResource = this.teamService.loadTeamsByTournament(this.tournamentId);

  readonly isLoading = computed(() => this.matchesResource.isLoading());
  private readonly teams = computed(() => this.teamsResource.value() ?? []);

  readonly matchdayGroups = computed((): MatchdayGroup[] => {
    const grouped = new Map<number, Match[]>();
    const noMatchday: Match[] = [];

    for (const match of this.matchesResource.value()?.content ?? []) {
      if (match.matchday !== null) {
        const list = grouped.get(match.matchday) ?? [];
        grouped.set(match.matchday, [...list, match]);
      } else {
        noMatchday.push(match);
      }
    }

    const groups: MatchdayGroup[] = Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([matchday, matches]) => ({ matchday, label: `Fecha ${matchday}`, matches }));

    if (noMatchday.length > 0) {
      groups.push({ matchday: null, label: 'Sin fecha asignada', matches: noMatchday });
    }

    return groups;
  });

  getTeamName(teamId: number): string {
    return this.teams().find(t => t.id === teamId)?.name ?? '-';
  }
}
