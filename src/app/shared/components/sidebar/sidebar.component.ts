import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Navigation item interface
 */
export interface NavItem {
  label: string;
  icon: string; // Font Awesome class (e.g., 'fas fa-trophy')
  route: string;
}

/**
 * Sidebar Component
 *
 * Collapsible navigation sidebar with animated transitions.
 * Displays navigation items with icons and labels.
 *
 * Features:
 * - Collapsible (expanded/collapsed states)
 * - Smooth transitions with Tailwind
 * - Active route highlighting
 * - Icon-only mode when collapsed
 * - OnPush change detection for performance
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  /**
   * Controls sidebar visibility state
   * true = expanded, false = collapsed
   */
  isOpen = input.required<boolean>();

  /**
   * Navigation items (placeholder - will be populated later)
   */
  navItems: NavItem[] = [
    {
      label: 'Tournaments',
      icon: 'fas fa-trophy',
      route: '/tournaments'
    }
  ];
}
