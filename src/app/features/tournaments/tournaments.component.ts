import { Component, inject, computed, input, linkedSignal, viewChild, effect } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentFormModalComponent } from './presentation/components/tournament-form-modal/tournament-form-modal.component';
import { TournamentManageComponent } from './presentation/components/tournament-manage/tournament-manage.component';
import { TeamStandingsComponent } from '../teams/presentation/components/team-standings/team-standings.component';
import { TeamListComponent } from '../teams/presentation/components/team-list/team-list.component';
import { MatchResultsByMatchdayComponent } from '../matches/presentation/components/match-results-by-matchday/match-results-by-matchday.component';
import { TournamentService } from './application/services';
import { TournamentRequestDto } from './domain/models';
import { AuthService } from '@app/features/auth/application/services';
import { AdminPanelService } from '@app/shared/services/admin-panel.service';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [TournamentFormModalComponent, TournamentManageComponent, TeamStandingsComponent, TeamListComponent, MatchResultsByMatchdayComponent],
  templateUrl: './tournaments.component.html',
})
export class TournamentsComponent {
  id = input.required<string>();

  private readonly router = inject(Router);
  private readonly tournamentService = inject(TournamentService);
  private readonly adminPanelService = inject(AdminPanelService);

  readonly isAdmin = inject(AuthService).isAdmin;
  readonly adminSection = this.adminPanelService.activeSection;

  private readonly teamList = viewChild(TeamListComponent);

  addTeam(): void { this.teamList()?.onAddTeam(); }

  readonly mode = computed(() => this.id() === 'new' ? 'list' : 'manage');
  readonly hasValidId = computed(() => Number(this.id()) > 0);
  readonly activeTab = linkedSignal<'standings' | 'next-date' | 'results'>(() => { this.id(); return 'standings'; });

  setTab(tab: 'standings' | 'next-date' | 'results'): void {
    this.activeTab.set(tab);
  }

  constructor() {
    effect(() => { this.id(); this.adminPanelService.clear(); });
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
