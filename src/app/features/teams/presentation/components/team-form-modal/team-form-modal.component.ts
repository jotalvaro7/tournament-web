import { Component, input, output, computed, linkedSignal } from '@angular/core';
import { form, required, minLength, maxLength, FormField } from '@angular/forms/signals';
import { Team, TeamRequestDto } from '../../../domain/models';

@Component({
  selector: 'app-team-form-modal',
  standalone: true,
  imports: [FormField],
  templateUrl: './team-form-modal.component.html'
})
export class TeamFormModalComponent {
  readonly team = input<Team | null>(null);
  readonly save = output<TeamRequestDto>();
  readonly close = output<void>();

  readonly model = linkedSignal({
    source: () => this.team(),
    computation: (team): TeamRequestDto =>
      team ? { name: team.name, coach: team.coach } : { name: '', coach: '' }
  });

  readonly teamForm = form(this.model, (f) => {
    required(f.name, { message: 'El nombre del equipo es requerido' });
    minLength(f.name, 3, { message: 'El nombre del equipo debe tener al menos 3 caracteres' });
    maxLength(f.name, 100, { message: 'El nombre del equipo no debe exceder los 100 caracteres' });

    required(f.coach, { message: 'El nombre del técnico es requerido' });
    minLength(f.coach, 3, { message: 'El nombre del técnico debe tener al menos 3 caracteres' });
    maxLength(f.coach, 100, { message: 'El nombre del técnico no debe exceder los 100 caracteres' });
  });

  readonly isValid = computed(() => this.teamForm().valid());
  readonly isEditMode = computed(() => this.team() !== null);
  readonly title = computed(() => this.isEditMode() ? 'Editar Equipo' : 'Agregar Equipo');


  onSubmit(event: Event): void {
    event.preventDefault();
    this.teamForm.name().markAsTouched();
    this.teamForm.coach().markAsTouched();

    if (this.isValid()) {
      this.save.emit(this.model());
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

  getErrorMessage(field: keyof TeamRequestDto): string {
    const fieldState = this.teamForm[field]();
    if (!fieldState.touched() || fieldState.valid()) return '';
    const errors = fieldState.errors();
    return errors.length > 0 ? (errors[0].message ?? errors[0].kind) : '';
  }

  hasError(field: keyof TeamRequestDto): boolean {
    const fieldState = this.teamForm[field]();
    return fieldState.touched() && fieldState.invalid();
  }
}