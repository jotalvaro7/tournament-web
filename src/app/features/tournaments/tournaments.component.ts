import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Tournaments Component
 *
 * Tournament list view (placeholder for future implementation)
 */
@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [],
  template: `
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Tournaments</h2>
      <p class="text-gray-600">Tournament management will be implemented here</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentsComponent {}
