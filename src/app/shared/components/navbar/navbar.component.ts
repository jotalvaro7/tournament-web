import { Component, ChangeDetectionStrategy, output } from '@angular/core';

/**
 * Navbar Component
 *
 * Top navigation bar with sidebar toggle button.
 * Emits toggleSidebar event when menu button is clicked.
 *
 * Features:
 * - Toggle button for sidebar
 * - Application title/logo area
 * - User profile section (placeholder for future implementation)
 * - OnPush change detection for performance
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  /**
   * Event emitted when sidebar toggle button is clicked
   */
  toggleSidebar = output<void>();

  /**
   * Handles menu button click
   */
  onToggleClick(): void {
    this.toggleSidebar.emit();
  }
}
