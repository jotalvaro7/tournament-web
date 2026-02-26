import { Component, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatchService } from '../../../application/services';
import { TeamService } from '@app/features/teams/application/services';
import { Match, MatchRequest, FinishMatchRequest, MatchFilterParams, MatchStatus } from '../../../domain/models';
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
  private readonly route = inject(ActivatedRoute);
  readonly matchService = inject(MatchService);
  private readonly teamService = inject(TeamService);

  private readonly params = toSignal(this.route.paramMap);

  readonly tournamentId = computed(() => {
    const id = this.params()?.get('id');
    return id ? Number(id) : null;
  });

  readonly showFormModal = signal(false);
  readonly showResultModal = signal(false);
  readonly selectedMatch = signal<Match | null>(null);
  readonly currentFilters = signal<MatchFilterParams>({});
  readonly hasSearched = signal(false);

  readonly matches = this.matchService.matches;
  readonly teams = this.teamService.teams;
  readonly isLoading = this.matchService.isLoading;
  readonly pagination = this.matchService.pagination;

  constructor() {
    effect(() => {
      const id = this.tournamentId();
      if (id) {
        this.teamService.loadTeamsByTournament(id);
      }
    });
  }

  onFilterChange(filters: { status?: MatchStatus; specificDate?: string; dateFrom?: string; dateTo?: string } | null): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    if (filters === null) {
      this.hasSearched.set(false);
      this.currentFilters.set({});
      return;
    }

    this.currentFilters.set(filters);
    this.hasSearched.set(true);
    this.matchService.loadMatches(tournamentId, filters);
  }

  onPageChange(page: number): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    const filters = { ...this.currentFilters(), page };
    this.currentFilters.set(filters);
    this.matchService.loadMatches(tournamentId, filters);
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

  onDeleteMatch(match: Match): void {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.matchService.deleteMatch(tournamentId, match.id);
    }
  }

  onPostponeMatch(match: Match): void {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.matchService.postponeMatch(tournamentId, match.id);
    }
  }

  onMatchSubmit(request: MatchRequest): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    const match = this.selectedMatch();

    if (match) {
      this.matchService.updateMatch(tournamentId, match.id, request);
    } else {
      this.matchService.createMatch(tournamentId, request);
    }

    this.closeFormModal();
  }

  onResultSubmit(request: FinishMatchRequest): void {
    const tournamentId = this.tournamentId();
    const match = this.selectedMatch();

    if (tournamentId && match) {
      this.matchService.finishMatch(tournamentId, match.id, request);
      this.closeResultModal();
    }
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