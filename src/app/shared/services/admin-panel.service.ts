import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminPanelService {
  readonly activeSection = signal<'teams' | null>(null);

  toggle(section: 'teams'): void {
    this.activeSection.update(current => current === section ? null : section);
  }

  clear(): void {
    this.activeSection.set(null);
  }
}
