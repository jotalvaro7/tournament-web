import { Component, inject, signal, computed, input } from '@angular/core';
import { MatchService } from '../../../application/services';
import { TeamService } from '@app/features/teams/application/services';
import { AuthService } from '@app/features/auth/application/services';
import { Match, MatchRequest, FinishMatchRequest, MatchFilterParams, MatchStatus } from '../../../domain/models';
import { MatchdayGroup } from '../../models/matchday-group.model';
import { MatchCardComponent } from '../match-card/match-card.component';
import { MatchFormModalComponent } from '../match-form-modal/match-form-modal.component';
import { MatchResultModalComponent } from '../match-result-modal/match-result-modal.component';
import { MatchDetailsModalComponent } from '../match-details-modal/match-details-modal.component';
import { MatchFiltersComponent } from '../match-filters/match-filters.component';
import { MatchPaginationComponent } from '../match-pagination/match-pagination.component';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [
    MatchCardComponent,
    MatchFormModalComponent,
    MatchResultModalComponent,
    MatchDetailsModalComponent,
    MatchFiltersComponent,
    MatchPaginationComponent
  ],
  templateUrl: './match-list.component.html'
})
export class MatchListComponent {
  readonly id = input<string>('');

  private readonly matchService = inject(MatchService);
  private readonly teamService = inject(TeamService);
  private readonly authService = inject(AuthService);

  readonly isAdmin = this.authService.isAdmin;

  readonly tournamentId = computed(() => Number(this.id()) || null);

  readonly showFormModal = signal(false);
  readonly showResultModal = signal(false);
  readonly selectedMatch = signal<Match | null>(null);
  private readonly DEFAULT_SORT: MatchFilterParams = { sortBy: 'matchday', secondarySortBy: 'matchDate' };
  readonly currentFilters = signal<MatchFilterParams | undefined>(this.DEFAULT_SORT);

  private readonly teamsListResource = this.teamService.loadTeamsByTournament(this.tournamentId);
  private readonly matchesResource = this.matchService.loadMatchesByTournament(
    this.tournamentId,
    this.currentFilters
  );

  readonly teams = computed(() => this.teamsListResource.value() ?? []);
  readonly matches = computed(() => this.matchesResource.value()?.content ?? []);
  readonly isLoading = computed(() => this.matchesResource.isLoading());
  readonly selectedMatchForDetails = computed(() => this.matchService.selectedMatch());
  readonly pagination = computed(() => {
    const r = this.matchesResource.value();
    if (!r) return null;
    const { content, ...meta } = r;
    return meta;
  });

  readonly matchdayGroups = computed((): MatchdayGroup[] => {
    const grouped = new Map<number, Match[]>();
    const noMatchday: Match[] = [];

    for (const match of this.matches()) {
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

  onFilterChange(filters: { status?: MatchStatus; specificDate?: string; dateFrom?: string; dateTo?: string } | null): void {
    this.currentFilters.set(filters ? { ...this.DEFAULT_SORT, ...filters } : this.DEFAULT_SORT);
  }

  onPageChange(page: number): void {
    this.currentFilters.update(f => ({ ...f, page }));
  }

  getTeamName(teamId: number): string {
    const team = this.teams().find(t => t.id === teamId);
    return team?.name ?? 'Unknown Team';
  }

  onCreateMatch(): void {
    this.selectedMatch.set(null);
    this.showFormModal.set(true);
  }

  onEditMatch(match: Match): void {
    this.selectedMatch.set(match);
    this.showFormModal.set(true);
  }

  onFinishMatch(match: Match): void {
    this.selectedMatch.set(match);
    this.showResultModal.set(true);
  }

  onMatchClick(match: Match): void {
    this.matchService.selectMatch(match);
  }

  async onDeleteMatch(match: Match): Promise<void> {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;
    await this.matchService.deleteMatch(tournamentId, match.id);
    this.matchesResource.reload();
  }

  async onPostponeMatch(match: Match): Promise<void> {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;
    await this.matchService.postponeMatch(tournamentId, match.id);
    this.matchesResource.reload();
  }

  onMatchSubmit(request: MatchRequest): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    const match = this.selectedMatch();
    if (match) {
      this.matchService.updateMatch(tournamentId, match.id, request).subscribe({
        next: () => {
          this.closeFormModal();
          this.matchesResource.reload();
        }
      });
    } else {
      this.matchService.createMatch(tournamentId, request).subscribe({
        next: () => {
          this.closeFormModal();
          this.matchesResource.reload();
        }
      });
    }
  }

  onResultSubmit(request: FinishMatchRequest): void {
    const tournamentId = this.tournamentId();
    const match = this.selectedMatch();
    if (!tournamentId || !match) return;

    this.matchService.finishMatch(tournamentId, match.id, request).subscribe({
      next: () => {
        this.closeResultModal();
        this.matchesResource.reload();
      }
    });
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.selectedMatch.set(null);
  }

  closeResultModal(): void {
    this.showResultModal.set(false);
    this.selectedMatch.set(null);
  }

  closeDetails(): void {
    this.matchService.selectMatch(null);
  }
}
