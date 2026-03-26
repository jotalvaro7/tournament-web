import { Component, inject, input, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '../../../application/services';

@Component({
  selector: 'app-team-standings',
  standalone: true,
  imports: [],
  templateUrl: './team-standings.component.html'
})
export class TeamStandingsComponent {
  readonly id = input<string>('');

  private readonly teamService = inject(TeamService);
  private readonly router = inject(Router);
  private readonly tournamentId = computed(() => Number(this.id()) || null);

  private readonly standingsResource = this.teamService.loadStandings(this.tournamentId);
  readonly standings = computed(() => this.standingsResource.value() ?? []);
  readonly isLoading = this.standingsResource.isLoading;

  onTeamClick(teamId: number): void {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.router.navigate(['/tournaments', tournamentId, 'teams', teamId]);
    }
  }
}
