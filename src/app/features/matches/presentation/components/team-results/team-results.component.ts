import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TeamService } from '@app/features/teams/application/services';

@Component({
  selector: 'app-team-results',
  standalone: true,
  imports: [],
  templateUrl: './team-results.component.html'
})
export class TeamResultsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly teamService = inject(TeamService);

  private readonly params = toSignal(this.route.paramMap);

  private readonly tournamentId = computed(() => {
    const id = this.params()?.get('id');
    return id ? Number(id) : null;
  });

  private readonly teamId = computed(() => {
    const id = this.params()?.get('teamId');
    return id ? Number(id) : null;
  });

  private readonly matchesResource = this.teamService.loadMatchesByTeam(this.tournamentId, this.teamId);
  private readonly teamsResource = this.teamService.loadTeamsByTournament(this.tournamentId);

  readonly matches = computed(() => this.matchesResource.value() ?? []);
  readonly isLoading = this.matchesResource.isLoading;
  readonly teams = computed(() => this.teamsResource.value() ?? []);

  getTeamName(teamId: number): string {
    return this.teams().find(t => t.id === teamId)?.name ?? '-';
  }
}
