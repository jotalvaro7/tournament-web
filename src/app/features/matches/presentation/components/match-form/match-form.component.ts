import { Component, input, output, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Match, MatchRequest, FinishMatchRequest } from '../../../domain/models';
import { Team } from '@app/features/teams/domain/models';

/**
 * Match Form Component
 *
 * Modern form for creating and editing matches
 * Also handles setting match results
 *
 * Features:
 * - Create mode: Select teams, set date and field
 * - Edit mode: Update match details
 * - Result mode: Set/update match scores
 * - Real-time validation
 * - Team selection from tournament teams
 * - Date picker with time
 * - Responsive design
 * - OnPush for performance
 */
@Component({
  selector: 'app-match-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './match-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchFormComponent implements OnInit {
  /** Match to edit (null for create mode) */
  readonly match = input<Match | null>(null);

  /** Available teams */
  readonly teams = input<Team[]>([]);

  /** Form mode: 'create' | 'edit' | 'result' */
  readonly mode = input<'create' | 'edit' | 'result'>('create');

  /** Event emitted when match is submitted */
  readonly matchSubmit = output<MatchRequest>();

  /** Event emitted when result is submitted */
  readonly resultSubmit = output<FinishMatchRequest>();

  /** Event emitted when form is cancelled */
  readonly cancel = output<void>();

  /** Form group */
  readonly formSignal = signal<FormGroup | null>(null);

  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize form based on mode
   */
  private initializeForm(): void {
    const currentMode = this.mode();
    const currentMatch = this.match();

    if (currentMode === 'result') {
      // Result form
      this.formSignal.set(this.fb.group({
        homeTeamScore: [
          currentMatch?.homeTeamScore ?? 0,
          [Validators.required, Validators.min(0)]
        ],
        awayTeamScore: [
          currentMatch?.awayTeamScore ?? 0,
          [Validators.required, Validators.min(0)]
        ]
      }));
    } else {
      // Create/Edit form
      const matchDate = currentMatch?.matchDate
        ? this.formatDateForInput(currentMatch.matchDate)
        : '';

      this.formSignal.set(this.fb.group({
        homeTeamId: [
          currentMatch?.homeTeamId ?? '',
          [Validators.required, Validators.min(1)]
        ],
        awayTeamId: [
          currentMatch?.awayTeamId ?? '',
          [Validators.required, Validators.min(1)]
        ],
        matchDate: [
          matchDate,
          [Validators.required]
        ],
        field: [
          currentMatch?.field ?? '',
          [Validators.required, Validators.minLength(1)]
        ]
      }));
    }
  }

  /**
   * Format date for datetime-local input
   */
  private formatDateForInput(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    const form = this.formSignal();
    if (!form || form.invalid) {
      form?.markAllAsTouched();
      return;
    }

    if (this.mode() === 'result') {
      this.resultSubmit.emit(form.value as FinishMatchRequest);
    } else {
      const formValue = form.value;
      const request: MatchRequest = {
        homeTeamId: Number(formValue.homeTeamId),
        awayTeamId: Number(formValue.awayTeamId),
        matchDate: new Date(formValue.matchDate).toISOString(),
        field: formValue.field
      };
      this.matchSubmit.emit(request);
    }
  }

  /**
   * Handle cancel button
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const form = this.formSignal();
    if (!form) return '';

    const control = form.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['min']) return 'El valor debe ser mayor o igual a 0';
    if (control.errors['minlength']) return 'El campo es demasiado corto';

    return '';
  }

  /**
   * Check if field has error
   */
  hasError(controlName: string): boolean {
    const form = this.formSignal();
    if (!form) return false;

    const control = form.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Get form title based on mode
   */
  getFormTitle(): string {
    switch (this.mode()) {
      case 'create':
        return 'Crear Partido';
      case 'edit':
        return 'Editar Partido';
      case 'result':
        return 'Registrar Resultado';
      default:
        return 'Partido';
    }
  }

  /**
   * Get submit button text based on mode
   */
  getSubmitButtonText(): string {
    switch (this.mode()) {
      case 'create':
        return 'Crear Partido';
      case 'edit':
        return 'Actualizar Partido';
      case 'result':
        return 'Guardar Resultado';
      default:
        return 'Guardar';
    }
  }

  /**
   * Get home team name
   */
  getHomeTeamName(): string {
    const currentMatch = this.match();
    if (!currentMatch) return '';

    const team = this.teams().find(t => t.id === currentMatch.homeTeamId);
    return team?.name ?? 'Equipo Local';
  }

  /**
   * Get away team name
   */
  getAwayTeamName(): string {
    const currentMatch = this.match();
    if (!currentMatch) return '';

    const team = this.teams().find(t => t.id === currentMatch.awayTeamId);
    return team?.name ?? 'Equipo Visitante';
  }
}
