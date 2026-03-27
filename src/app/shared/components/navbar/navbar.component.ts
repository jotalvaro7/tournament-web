import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/features/auth/application/services';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly elementRef = inject(ElementRef);
  private readonly router = inject(Router);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isAdmin = this.authService.isAdmin;
  readonly currentUser = this.authService.currentUser;
  readonly showAdminMenu = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showAdminMenu.set(false);
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showAdminMenu.update(v => !v);
  }

  navigateToPanel(): void {
    const match = this.router.url.match(/\/tournaments\/(\d+)/);
    if (match) {
      this.router.navigate(['/tournaments', match[1], 'panel']);
    }
    this.showAdminMenu.set(false);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
