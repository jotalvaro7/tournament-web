import { Component, computed, inject, input, linkedSignal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '../../../application/services';
import { PlayerListComponent } from '@app/features/players/presentation/components/player-list/player-list.component';
import { TeamResultsComponent } from '../../components/team-results/team-results.component';
import { AuthService } from '@app/features/auth/application/services';

@Component({
  selector: 'app-team-page',
  standalone: true,
  imports: [PlayerListComponent, TeamResultsComponent],
  templateUrl: './team-page.component.html'
})
export class TeamPageComponent {
  readonly id = input<string>('');
  readonly teamId = input<string>('');

  private readonly teamService = inject(TeamService);
  private readonly router = inject(Router);

  readonly isAdmin = inject(AuthService).isAdmin;
  private readonly playerList = viewChild(PlayerListComponent);

  private readonly tournamentId = computed(() => Number(this.id()) || null);
  private readonly teamIdNum = computed(() => Number(this.teamId()) || null);

  private readonly teamResource = this.teamService.loadTeam(this.tournamentId, this.teamIdNum);
  readonly team = computed(() => this.teamResource.value() ?? null);
  readonly isLoading = this.teamResource.isLoading;

  readonly activeTab = linkedSignal<'players' | 'results'>(() => {
    this.teamId();
    return 'players';
  });

  setTab(tab: 'players' | 'results'): void {
    this.activeTab.set(tab);
  }

  addPlayer(): void {
    this.playerList()?.onAddPlayer();
  }

  onBack(): void {
    this.router.navigate(['/tournaments', this.id()]);
  }
}
