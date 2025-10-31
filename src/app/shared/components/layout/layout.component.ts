import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

/**
 * Layout Component
 *
 * Main application layout with collapsible sidebar and top navbar.
 * Manages sidebar state using signals for reactive updates.
 *
 * Features:
 * - Responsive sidebar (collapsible)
 * - Top navigation bar with toggle button
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
}
