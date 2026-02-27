import { Component, input, output, computed, linkedSignal } from '@angular/core';
import { form, required, minLength, maxLength, FormField } from '@angular/forms/signals';
import { Tournament, TournamentRequestDto } from '../../../domain/models';

@Component({
  selector: 'app-tournament-form-modal',
  standalone: true,
  imports: [FormField],
  templateUrl: './tournament-form-modal.component.html',
})
export class TournamentFormModalComponent {
  tournament = input<Tournament | null>(null);
  save = output<TournamentRequestDto>();
  close = output<void>();

  readonly model = linkedSignal({
    source: () => this.tournament(),
    computation: (tournament) =>
      tournament
        ? {
            name: tournament.name,
            description: tournament.description,
          }
        : {
            name: '',
            description: '',
          },
  });

  readonly tournamentForm = form(this.model, (f) => {
    required(f.name, { message: 'Name is required' });
    minLength(f.name, 3, { message: 'Name must be at least 3 characters' });
    maxLength(f.name, 100, { message: 'Name must not exceed 100 characters' });

    required(f.description, { message: 'Description is required' });
    minLength(f.description, 10, { message: 'Description must be at least 10 characters' });
    maxLength(f.description, 500, { message: 'Description must not exceed 500 characters' });
  });

  readonly isEditMode = computed(() => this.tournament() !== null);
  readonly title = computed(() => (this.isEditMode() ? 'Edit Tournament' : 'Create Tournament'));

  onSubmit(event: Event): void {
    event.preventDefault();
    this.save.emit(this.model() as TournamentRequestDto);
  }

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getErrorMessage(field: 'name' | 'description'): string {
    const fieldState = this.tournamentForm[field]();
    if (!fieldState.touched() || fieldState.valid()) return '';
    const errors = fieldState.errors();
    return errors.length > 0 ? (errors[0].message ?? errors[0].kind) : '';
  }

  hasError(field: 'name' | 'description'): boolean {
    const fieldState = this.tournamentForm[field]();
    return fieldState.touched() && fieldState.invalid();
  }
}
