import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Match Pagination Component
 *
 * Simple pagination controls
 * Emits page change events to parent component
 */
@Component({
  selector: 'app-match-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchPaginationComponent {
  // Inputs
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalElements = input.required<number>();
  readonly hasNext = input.required<boolean>();
  readonly hasPrevious = input.required<boolean>();

  // Outputs
  readonly pageChange = output<number>();

  // Computed
  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const start = Math.max(0, Math.min(current - 2, total - maxVisible));
    return Array.from({ length: maxVisible }, (_, i) => start + i);
  });

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    if (this.hasPrevious()) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.hasNext()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }
}