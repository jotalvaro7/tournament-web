import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from '../../../application/services';
import { Team, TeamRequestDto } from '../../../domain/models';
import { TeamFormComponent } from '../team-form/team-form.component';
import { TeamDetailsModalComponent } from '../team-details-modal/team-details-modal.component';

/**
 * Team List Component
 *
 * Displays teams in an ultra-minimalist vertical list with modal details view.
 * Optimized for handling large numbers of teams (50+) with clean, uncluttered UI.
 *
 * Features:
 * - Minimalist vertical list (position, icon, name, coach only)
 * - NO statistics shown in list (keeps view clean)
 * - Position numbering (#1, #2, etc.)
 * - Click any team to open detailed modal with full stats
 * - Modern modal with comprehensive statistics and analytics
 * - Add new team to tournament
 * - Edit/delete from modal
 * - OnPush change detection for performance
 *
 * UI Design Philosophy:
 * - List: Ultra-simple → Position | Icon | Name/Coach | Chevron
 * - Modal: Complete → All statistics, metrics, and actions
 * - Separation of concerns: List = navigation, Modal = details
 * - Hover effects indicate clickability
 * - Perfect for scanning many teams quickly
 *
 * List Shows:
 * - Position number (circular badge)
 * - Team icon
 * - Team name (bold)
 * - Coach name (with icon)
 * - Chevron indicating clickable
 *
 * Modal Shows:
 * - Header with team name and coach
 * - Primary stats: Points, Matches, Goals, Goal Difference
 * - Match results breakdown: Wins, Draws, Losses
 * - Performance metrics: Win Rate, Points Per Match
 * - Action buttons: Edit, Delete, Close
 *
 * Architecture:
 * - Uses TeamService (facade) for all operations
 * - Reactive state management with signals
 * - Modal state managed via signal (selectedTeamForModal)
 * - Clean separation of concerns
 */
@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [TeamFormComponent, TeamDetailsModalComponent],
  templateUrl: './team-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamListComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly teamService = inject(TeamService);

  /**
   * Current tournament ID from route
   */
  readonly tournamentId = signal<number | null>(null);

  /**
   * Teams signal from service
   */
  readonly teams = this.teamService.teams;

  /**
   * Loading state signal from service
   */
  readonly isLoading = this.teamService.isLoading;

  /**
   * Signal indicating if form is shown
   */
  readonly showForm = signal(false);

  /**
   * Signal holding the team being edited (null for create mode)
   */
  readonly editingTeam = signal<Team | null>(null);

  /**
   * Signal holding the team to display in modal
   * null = modal closed
   */
  readonly selectedTeamForModal = signal<Team | null>(null);

  ngOnInit(): void {
    // Get tournament ID from route
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const tournamentId = Number(id);
      this.tournamentId.set(tournamentId);
      this.teamService.loadTeamsByTournament(tournamentId);
    }
  }

  ngOnDestroy(): void {
    // Clear teams when leaving component
    this.teamService.clearTeams();
  }

  /**
   * Handles add team button click
   * Shows form in create mode
   */
  onAddTeam(): void {
    this.editingTeam.set(null);
    this.showForm.set(true);
  }

  /**
   * Handles remove team action
   */
  onRemoveTeam(team: Team): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    this.teamService.delete(tournamentId, team);
  }

  /**
   * Handles edit team action
   * Shows form in edit mode with team data
   */
  onEditTeam(team: Team): void {
    this.editingTeam.set(team);
    this.showForm.set(true);
  }

  /**
   * Handles team form save event
   * Creates or updates team based on edit mode
   */
  onSaveTeam(request: TeamRequestDto): void {
    const tournamentId = this.tournamentId();
    if (!tournamentId) return;

    const editingTeam = this.editingTeam();

    if (editingTeam) {
      // Update mode
      this.teamService.update(tournamentId, editingTeam.id, request).subscribe({
        next: () => {
          this.showForm.set(false);
          this.editingTeam.set(null);
        }
      });
    } else {
      // Create mode
      this.teamService.create(tournamentId, request).subscribe({
        next: () => {
          this.showForm.set(false);
        }
      });
    }
  }

  /**
   * Handles team form cancel event
   * Hides form and clears edit state
   */
  onCancelForm(): void {
    this.showForm.set(false);
    this.editingTeam.set(null);
  }

  /**
   * Opens modal with team details
   */
  openTeamDetails(team: Team): void {
    this.selectedTeamForModal.set(team);
  }

  /**
   * Closes the team details modal
   */
  closeTeamDetails(): void {
    this.selectedTeamForModal.set(null);
  }

  /**
   * Opens edit form from modal
   */
  editFromModal(team: Team): void {
    this.closeTeamDetails();
    this.onEditTeam(team);
  }

  /**
   * Deletes team from modal
   */
  deleteFromModal(team: Team): void {
    this.closeTeamDetails();
    this.onRemoveTeam(team);
  }
}
