import { Component, computed, inject, input } from '@angular/core';
import { TeamService } from '../../../application/services';

@Component({
  selector: 'app-team-results',
  standalone: true,
  imports: [],
  templateUrl: './team-results.component.html'
})
export class TeamResultsComponent {
  readonly id = input<string>('');
  readonly teamId = input<string>('');

  private readonly teamService = inject(TeamService);

  private readonly tournamentId = computed(() => Number(this.id()) || null);
  private readonly teamIdNum = computed(() => Number(this.teamId()) || null);

  private readonly matchesResource = this.teamService.loadMatchesByTeam(this.tournamentId, this.teamIdNum);
  private readonly teamsResource = this.teamService.loadTeamsByTournament(this.tournamentId);

  readonly matches = computed(() => this.matchesResource.value() ?? []);
  readonly isLoading = this.matchesResource.isLoading;
  private readonly teams = computed(() => this.teamsResource.value() ?? []);

  getTeamName(teamId: number): string {
    return this.teams().find(t => t.id === teamId)?.name ?? '-';
  }
}
