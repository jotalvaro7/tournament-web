import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

/**
 * Layout Component
 *
 * Main application layout with top header and full-width content area.
 * Manages tournament navigation.
 *
 * Features:
 * - Top navigation header with tournament selector
 * - Full-width content area with max-width constraint
 * - Tournament selection and creation routing
 * - Zoneless change detection with signals
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  private readonly router = inject(Router);

  /**
   * Handles create tournament event from navbar
   * Navigates to create tournament route
   */
  onCreateTournament(): void {
    this.router.navigate(['/tournaments', 'new']);
  }

  /**
   * Handles tournament selection from navbar
   * Navigates to selected tournament route
   */
  onSelectTournament(tournamentId: number): void {
    this.router.navigate(['/tournaments', tournamentId]);
  }
}
