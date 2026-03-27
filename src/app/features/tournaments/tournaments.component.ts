import { Component, inject, computed, input, linkedSignal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentFormModalComponent } from './presentation/components/tournament-form-modal/tournament-form-modal.component';
import { TournamentManageComponent } from './presentation/components/tournament-manage/tournament-manage.component';
import { TeamStandingsComponent } from '../teams/presentation/components/team-standings/team-standings.component';
import { TeamListComponent } from '../teams/presentation/components/team-list/team-list.component';
import { MatchListComponent } from '../matches/presentation/components/match-list/match-list.component';
import { TournamentService } from './application/services';
import { TournamentRequestDto } from './domain/models';
import { AuthService } from '@app/features/auth/application/services';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [TournamentFormModalComponent, TournamentManageComponent, TeamStandingsComponent, TeamListComponent, MatchListComponent],
  templateUrl: './tournaments.component.html',
})
export class TournamentsComponent {
  id = input.required<string>();

  private readonly router = inject(Router);
  private readonly tournamentService = inject(TournamentService);

  readonly isAdmin = inject(AuthService).isAdmin;

  private readonly teamList = viewChild(TeamListComponent);
  private readonly matchList = viewChild(MatchListComponent);

  addTeam(): void { this.teamList()?.onAddTeam(); }
  addMatch(): void { this.matchList()?.onCreateMatch(); }

  readonly mode = computed(() => this.id() === 'new' ? 'list' : 'manage');
  readonly hasValidId = computed(() => Number(this.id()) > 0);
  readonly activeTab = linkedSignal<'standings' | 'next-date' | 'teams' | 'matches'>(() => { this.id(); return 'standings'; });

  setTab(tab: 'standings' | 'next-date' | 'teams' | 'matches'): void {
    this.activeTab.set(tab);
  }

  readonly showCreateModal = linkedSignal(() => this.id() === 'new');

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  async onCreateSave(request: TournamentRequestDto): Promise<void> {
    const tournament = await this.tournamentService.create(request);
    this.showCreateModal.set(false);
    this.router.navigate(['/tournaments', tournament.id]);
  }

  onCreateClose(): void {
    this.showCreateModal.set(false);
    if (this.id() === 'new') {
      this.router.navigate(['/tournaments']);
    }
  }
}
