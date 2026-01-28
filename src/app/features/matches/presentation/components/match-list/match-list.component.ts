import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../../../application/services';
import { TeamService } from '@app/features/teams/application/services';
import { Match, MatchRequest, FinishMatchRequest, MatchFilterParams, MatchStatus } from '../../../domain/models';
import { Team } from '@app/features/teams/domain/models';
import { MatchCardComponent } from '../match-card/match-card.component';
import { MatchFormComponent } from '../match-form/match-form.component';
import { MatchDetailsModalComponent } from '../match-details-modal/match-details-modal.component';
import { MatchFiltersComponent } from '../match-filters/match-filters.component';
import { MatchPaginationComponent } from '../match-pagination/match-pagination.component';

/**
 * Match List Component
 *
 * Main container for match management
 * Modern, youthful and elegant design
 *
 * Features:
 * - Grid layout with match cards
 * - Create/Edit match functionality
 * - Set/update match results
 * - Filter by status, specific date, or date range
 * - Lazy loading: NO automatic data fetch on init
 * - User MUST apply filters to load matches (prevents unnecessary API calls)
 * - Modal for match details
 * - Initial state, empty state, and loading states
 * - Pagination support
 * - Responsive design
 * - OnPush for performance
 */
@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [
    MatchCardComponent,
    MatchFormComponent,
    MatchDetailsModalComponent,
    MatchFiltersComponent,
    MatchPaginationComponent
],
  templateUrl: './match-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly matchService = inject(MatchService);
  private readonly teamService = inject(TeamService);

  // State
  readonly tournamentId = signal<number | null>(null);
  readonly showForm = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'result'>('create');
  readonly selectedMatch = signal<Match | null>(null);
  readonly currentFilters = signal<MatchFilterParams>({});
  readonly hasSearched = signal<boolean>(false);

  // Service state
  readonly matches = this.matchService.matches;
  readonly teams = this.teamService.teams;
  readonly isLoading = this.matchService.isLoading;
  readonly pagination = this.matchService.pagination;

  ngOnInit(): void {
    // Get tournament ID from route
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const tournamentId = Number(id);
        this.tournamentId.set(tournamentId);
        // Only load teams, not matches - user must apply filters first
        this.teamService.loadTeamsByTournament(tournamentId);
      }
    });
  }

  /**
   * Handle filter change
   */
  onFilterChange(filters: { status?: MatchStatus; specificDate?: string; dateFrom?: string; dateTo?: string } | null): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    // If filters is null, user cleared filters - reset to initial state
    if (filters === null) {
      this.hasSearched.set(false);
      this.currentFilters.set({});
      return;
    }

    this.currentFilters.set(filters);
    this.hasSearched.set(true);
    this.matchService.loadMatches(tournamentId, filters);
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    const filters = { ...this.currentFilters(), page };
    this.currentFilters.set(filters);
    this.matchService.loadMatches(tournamentId, filters);
  }

  /**
   * Get team name by ID
   */
  getTeamName(teamId: number): string {
    const team = this.teams().find(t => t.id === teamId);
    return team?.name ?? 'Equipo Desconocido';
  }

  /**
   * Open create match form
   */
  onCreateMatch(): void {
    this.formMode.set('create');
    this.selectedMatch.set(null);
    this.showForm.set(true);
  }

  /**
   * Open edit match form
   */
  onEditMatch(match: Match): void {
    this.formMode.set('edit');
    this.selectedMatch.set(match);
    this.showForm.set(true);
  }

  /**
   * Open result form
   */
  onFinishMatch(match: Match): void {
    this.formMode.set('result');
    this.selectedMatch.set(match);
    this.showForm.set(true);
  }

  /**
   * Handle match card click (show details)
   */
  onMatchClick(match: Match): void {
    this.matchService.selectMatch(match);
  }

  /**
   * Handle delete match
   */
  onDeleteMatch(match: Match): void {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.matchService.deleteMatch(tournamentId, match.id);
    }
  }

  /**
   * Handle postpone match
   */
  onPostponeMatch(match: Match): void {
    const tournamentId = this.tournamentId();
    if (tournamentId) {
      this.matchService.postponeMatch(tournamentId, match.id);
    }
  }

  /**
   * Handle match form submission
   */
  onMatchSubmit(request: MatchRequest): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    const mode = this.formMode();
    const match = this.selectedMatch();

    if (mode === 'create') {
      this.matchService.createMatch(tournamentId, request);
    } else if (mode === 'edit' && match) {
      this.matchService.updateMatch(tournamentId, match.id, request);
    }

    this.closeForm();
  }

  /**
   * Handle result form submission
   */
  onResultSubmit(request: FinishMatchRequest): void {
    const tournamentId = this.tournamentId();
    const match = this.selectedMatch();

    if (tournamentId && match) {
      this.matchService.finishMatch(tournamentId, match.id, request);
      this.closeForm();
    }
  }

  /**
   * Close form
   */
  closeForm(): void {
    this.showForm.set(false);
    this.selectedMatch.set(null);
  }

  /**
   * Close details modal
   */
  closeDetails(): void {
    this.matchService.selectMatch(null);
  }
}
