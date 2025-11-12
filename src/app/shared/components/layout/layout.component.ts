import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

/**
 * Layout Component
 *
 * Main application layout with collapsible sidebar and top navbar.
 * Manages sidebar state and handles tournament navigation.
 *
 * Features:
 * - Responsive sidebar (collapsible)
 * - Top navigation bar with toggle button
 * - Tournament selection and creation routing
 * - Content area with router outlet
 * - OnPush change detection for performance
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
  private readonly router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  /**
   * Signal to control sidebar visibility
   * true = expanded, false = collapsed
   */
  isSidebarOpen = signal(true);

  /**
   * Toggles sidebar open/close state
   */
  toggleSidebar(): void {
    this.isSidebarOpen.update(isOpen => !isOpen);
  }

  /**
   * Handles create tournament event from sidebar
   * Navigates to create tournament route
   */
  onCreateTournament(): void {
    this.router.navigate(['/tournaments', 'new']);
  }

  /**
   * Handles tournament selection from sidebar
   * Navigates to selected tournament route
   */
  onSelectTournament(tournamentId: number): void {
    this.router.navigate(['/tournaments', tournamentId]);
  }
}
