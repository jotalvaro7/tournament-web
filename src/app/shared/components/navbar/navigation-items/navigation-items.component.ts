import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Navigation item interface
 */
export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

/**
 * Navigation Items Component (Header variant)
 *
 * Displays horizontal navigation links with icons.
 * Used inside the header bar.
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
  /** Navigation items to display */
  readonly navItems = input.required<NavItem[]>();
}
