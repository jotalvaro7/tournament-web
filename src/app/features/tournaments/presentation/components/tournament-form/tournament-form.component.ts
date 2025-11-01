import { Component, ChangeDetectionStrategy, input, output, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Tournament, TournamentRequestDto } from '../../../domain/models';

/**
 * Tournament Form Component
 *
 * Reusable inline form for creating or editing tournaments.
 * Uses reactive forms with validation based on API requirements.
 *
 * Features:
 * - Create mode (no tournament input)
 * - Edit mode (tournament input provided)
 * - Client-side validation (name: 3-100 chars, description: 10-500 chars)
 * - Clean Tailwind UI
 * - OnPush change detection for performance
 */
@Component({
  selector: 'app-tournament-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tournament-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentFormComponent {
  private readonly fb = inject(FormBuilder);

  /**
   * Tournament to edit (optional)
   * If provided, form will be in edit mode
   */
  tournament = input<Tournament | null>(null);

  /**
   * Event emitted when form is submitted
   * Emits the tournament request DTO
   */
  save = output<TournamentRequestDto>();

  /**
   * Event emitted when user cancels the form
   */
  cancel = output<void>();

  /**
   * Reactive form group
   */
  readonly form: FormGroup;

  constructor() {
    // Initialize form with validators matching API requirements
    this.form = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]]
    });

    // Update form when tournament input changes (edit mode)
    effect(() => {
      const tournament = this.tournament();
      if (tournament) {
        this.form.patchValue({
          name: tournament.name,
          description: tournament.description
        });
      } else {
        this.form.reset();
      }
    });
  }

  /**
   * Handles form submission
   */
  onSubmit(): void {
    if (this.form.valid) {
      this.save.emit(this.form.value as TournamentRequestDto);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Handles cancel button click
   */
  onCancel(): void {
    this.form.reset();
    this.cancel.emit();
  }

  /**
   * Gets error message for a form field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);

    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }

    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must not exceed ${maxLength} characters`;
    }

    return '';
  }

  /**
   * Gets user-friendly field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      name: 'Name',
      description: 'Description'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Checks if a field has an error and is touched
   */
  hasError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.touched && control.invalid);
  }
}
