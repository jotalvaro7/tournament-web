import { Component, ChangeDetectionStrategy, input, output, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Team, TeamRequestDto } from '../../../domain/models';

/**
 * Team Form Component
 *
 * Reusable inline form for creating or editing teams.
 * Uses reactive forms with validation based on API requirements.
 *
 * Features:
 * - Create mode (no team input)
 * - Edit mode (team input provided)
 * - Client-side validation (name: 3-100 chars, coach: 3-100 chars)
 * - Clean Tailwind UI
 * - OnPush change detection for performance
 */
@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './team-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamFormComponent {
  private readonly fb = inject(FormBuilder);

  /**
   * Team to edit (optional)
   * If provided, form will be in edit mode
   */
  team = input<Team | null>(null);

  /**
   * Event emitted when form is submitted
   * Emits the team request DTO
   */
  save = output<TeamRequestDto>();

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
      coach: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]]
    });

    // Update form when team input changes (edit mode)
    effect(() => {
      const team = this.team();
      if (team) {
        this.form.patchValue({
          name: team.name,
          coach: team.coach
        });
      } else {
        this.form.reset();
      }
    });
  }

  /**
   * Handles form submission
   * Emits save event with form data
   */
  onSubmit(): void {
    if (this.form.valid) {
      const request: TeamRequestDto = {
        name: this.form.value.name,
        coach: this.form.value.coach
      };
      this.save.emit(request);
    }
  }

  /**
   * Handles cancel button click
   * Emits cancel event
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Gets error message for a form field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.capitalize(fieldName)} is required`;
    }
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `${this.capitalize(fieldName)} must be at least ${minLength} characters`;
    }
    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `${this.capitalize(fieldName)} cannot exceed ${maxLength} characters`;
    }

    return '';
  }

  /**
   * Capitalizes first letter of a string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Checks if a field has errors and has been touched
   */
  hasError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.errors && control.touched);
  }
}
