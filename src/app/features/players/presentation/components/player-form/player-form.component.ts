import { Component, ChangeDetectionStrategy, input, output, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Player, PlayerRequestDto } from '../../../domain/models';

/**
 * Player Form Component
 *
 * Reusable inline form for creating or editing players.
 * Uses reactive forms with validation based on API requirements.
 */
@Component({
  selector: 'app-player-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './player-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerFormComponent {
  private readonly fb = inject(FormBuilder);

  /** Player to edit (optional) */
  player = input<Player | null>(null);

  /** Event emitted when form is submitted */
  save = output<PlayerRequestDto>();

  /** Event emitted when user cancels */
  cancel = output<void>();

  /** Reactive form group */
  readonly form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(70)
      ]],
      identificationNumber: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20)
      ]]
    });

    effect(() => {
      const player = this.player();
      if (player) {
        this.form.patchValue({
          name: player.name,
          lastName: player.lastName,
          identificationNumber: player.identificationNumber
        });
      } else {
        this.form.reset();
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const request: PlayerRequestDto = {
        name: this.form.value.name,
        lastName: this.form.value.lastName,
        identificationNumber: this.form.value.identificationNumber
      };
      this.save.emit(request);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    const labels: Record<string, string> = {
      name: 'First name',
      lastName: 'Last name',
      identificationNumber: 'ID number'
    };
    const label = labels[fieldName] || fieldName;

    if (control.errors['required']) return `${label} is required`;
    if (control.errors['minlength']) {
      return `${label} must be at least ${control.errors['minlength'].requiredLength} character`;
    }
    if (control.errors['maxlength']) {
      return `${label} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  hasError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.errors && control.touched);
  }
}
