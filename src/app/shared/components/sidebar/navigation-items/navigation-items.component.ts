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
 * Navigation Items Component
 *
 * Displays list of navigation links with icons.
 * Handles active state styling and collapsed/expanded views.
 *
 * Responsibilities:
 * - Render navigation items
 * - Show icons in collapsed mode
 * - Show icons + labels in expanded mode
 * - Apply active styling based on current route
 *
 * This component is purely presentational.
 */
@Component({
  selector: 'app-navigation-items',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation-items.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationItemsComponent {
  /**
   * Controls expanded/collapsed view
   */
  readonly isOpen = input.required<boolean>();

  /**
   * Navigation items to display
   */
  readonly navItems = input.required<NavItem[]>();
}
