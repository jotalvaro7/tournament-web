import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { AuthApiService } from '../../infrastructure/auth-api.service';
import { AuthUser, LoginRequestDto, UserRole } from '../../domain/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private readonly currentUserSignal = signal<AuthUser | null>(this.loadUserFromStorage());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === UserRole.ADMIN);

  login(credentials: LoginRequestDto): Observable<void> {
    return this.authApi.login(credentials).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        const user: AuthUser = {
          email: response.email,
          username: response.username,
          role: response.role
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
        this.router.navigate(['/tournaments']);
      }),
      map(() => void 0)
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromStorage(): AuthUser | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as AuthUser;
    } catch {
      return null;
    }
  }
}
