import { Component, ChangeDetectionStrategy, input, output, signal, computed, effect } from '@angular/core';
import { form, required, minLength, maxLength, FormField } from '@angular/forms/signals';
import { Player, PlayerRequestDto } from '../../../domain/models';

@Component({
  selector: 'app-player-form-modal',
  standalone: true,
  imports: [FormField],
  templateUrl: './player-form-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerFormModalComponent {
  player = input<Player | null>(null);
  save = output<PlayerRequestDto>();
  close = output<void>();

  readonly model = signal({ name: '', lastName: '', identificationNumber: '' });

  readonly playerForm = form(this.model, (f) => {
    required(f.name, { message: 'First name is required' });
    minLength(f.name, 1, { message: 'First name is required' });
    maxLength(f.name, 50, { message: 'First name must not exceed 50 characters' });

    required(f.lastName, { message: 'Last name is required' });
    minLength(f.lastName, 1, { message: 'Last name is required' });
    maxLength(f.lastName, 70, { message: 'Last name must not exceed 70 characters' });

    required(f.identificationNumber, { message: 'ID number is required' });
    minLength(f.identificationNumber, 1, { message: 'ID number is required' });
    maxLength(f.identificationNumber, 20, { message: 'ID number must not exceed 20 characters' });
  });

  readonly isValid = computed(() => this.playerForm().valid());
  readonly isEditMode = computed(() => this.player() !== null);
  readonly title = computed(() => this.isEditMode() ? 'Edit Player' : 'Add Player');

  constructor() {
    effect(() => {
      const player = this.player();
      if (player) {
        this.model.set({
          name: player.name,
          lastName: player.lastName,
          identificationNumber: player.identificationNumber
        });
      } else {
        this.model.set({ name: '', lastName: '', identificationNumber: '' });
      }
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.playerForm.name().markAsTouched();
    this.playerForm.lastName().markAsTouched();
    this.playerForm.identificationNumber().markAsTouched();

    if (this.isValid()) {
      this.save.emit(this.model() as PlayerRequestDto);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getErrorMessage(field: 'name' | 'lastName' | 'identificationNumber'): string {
    const fieldState = this.playerForm[field]();
    if (!fieldState.touched() || fieldState.valid()) return '';
    const errors = fieldState.errors();
    return errors.length > 0 ? (errors[0].message ?? errors[0].kind) : '';
  }

  hasError(field: 'name' | 'lastName' | 'identificationNumber'): boolean {
    const fieldState = this.playerForm[field]();
    return fieldState.touched() && fieldState.invalid();
  }
}