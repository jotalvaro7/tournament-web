import { Component, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchStatus } from '../../../domain/models';

/**
 * Match Filters Component
 *
 * Simple filter controls for match list
 * Emits filter changes to parent component
 */
@Component({
  selector: 'app-match-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './match-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchFiltersComponent {
  // Outputs
  readonly filterChange = output<{
    status?: MatchStatus;
    specificDate?: string;
    dateFrom?: string;
    dateTo?: string;
  }>();

  // Filter state
  readonly status = signal<MatchStatus | ''>('');
  readonly specificDate = signal<string>('');
  readonly dateFrom = signal<string>('');
  readonly dateTo = signal<string>('');
  readonly useDateRange = signal<boolean>(false);

  // Available status options
  readonly statusOptions: { value: MatchStatus | '', label: string }[] = [
    { value: '', label: 'Todos los estados' },
    { value: MatchStatus.SCHEDULED, label: 'Programados' },
    { value: MatchStatus.FINISHED, label: 'Finalizados' },
    { value: MatchStatus.POSTPONED, label: 'Pospuestos' }
  ];

  /**
   * Handle filter change
   */
  onFilterChange(): void {
    const filters: any = {};

    if (this.status()) {
      filters.status = this.status() as MatchStatus;
    }

    if (this.useDateRange()) {
      if (this.dateFrom()) filters.dateFrom = this.dateFrom();
      if (this.dateTo()) filters.dateTo = this.dateTo();
    } else {
      if (this.specificDate()) filters.specificDate = this.specificDate();
    }

    this.filterChange.emit(filters);
  }

  /**
   * Toggle date range mode
   */
  toggleDateRange(useRange: boolean): void {
    this.useDateRange.set(useRange);
    if (useRange) {
      this.specificDate.set('');
    } else {
      this.dateFrom.set('');
      this.dateTo.set('');
    }
    this.onFilterChange();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.status.set('');
    this.specificDate.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.useDateRange.set(false);
    this.filterChange.emit({});
  }
}
