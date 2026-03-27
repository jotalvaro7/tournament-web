import { Component, inject, input, signal, computed, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TeamListComponent } from '@app/features/teams/presentation/components/team-list/team-list.component';
import { PlayerListComponent } from '@app/features/players/presentation/components/player-list/player-list.component';
import { MatchListComponent } from '@app/features/matches/presentation/components/match-list/match-list.component';
import { TeamService } from '@app/features/teams/application/services';

type PanelTab = 'teams' | 'players' | 'matches';

@Component({
  selector: 'app-admin-panel-page',
  standalone: true,
  imports: [FormsModule, TeamListComponent, PlayerListComponent, MatchListComponent],
  templateUrl: './admin-panel-page.component.html'
})
export class AdminPanelPageComponent {
  readonly id = input.required<string>();

  private readonly teamService = inject(TeamService);

  private readonly tournamentId = computed(() => Number(this.id()) || null);
  private readonly teamsResource = this.teamService.loadTeamsByTournament(this.tournamentId);

  readonly teams = computed(() => this.teamsResource.value() ?? []);
  readonly activeTab = signal<PanelTab>('teams');
  readonly selectedTeamId = signal<string>('');

  private readonly playerList = viewChild(PlayerListComponent);

  setTab(tab: PanelTab): void {
    this.activeTab.set(tab);
    this.selectedTeamId.set('');
  }

  addPlayer(): void {
    this.playerList()?.onAddPlayer();
  }
}
