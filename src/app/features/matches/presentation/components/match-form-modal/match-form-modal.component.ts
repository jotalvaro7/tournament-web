import { Component, ChangeDetectionStrategy, input, output, signal, computed, effect } from '@angular/core';
import { form, required, minLength, FormField } from '@angular/forms/signals';
import { Match, MatchRequest } from '../../../domain/models';
import { Team } from '@app/features/teams/domain/models';

@Component({
  selector: 'app-match-form-modal',
  standalone: true,
  imports: [FormField],
  templateUrl: './match-form-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchFormModalComponent {
  match = input<Match | null>(null);
  teams = input<Team[]>([]);
  save = output<MatchRequest>();
  close = output<void>();

  readonly model = signal({
    homeTeamId: '',
    awayTeamId: '',
    matchDate: '',
    field: ''
  });

  readonly matchForm = form(this.model, (f) => {
    required(f.homeTeamId, { message: 'Home team is required' });
    required(f.awayTeamId, { message: 'Away team is required' });
    required(f.matchDate, { message: 'Date is required' });
    required(f.field, { message: 'Field is required' });
    minLength(f.field, 1, { message: 'Field is required' });
  });

  readonly isValid = computed(() => this.matchForm().valid());
  readonly isEditMode = computed(() => this.match() !== null);
  readonly title = computed(() => this.isEditMode() ? 'Edit Match' : 'Create Match');

  readonly availableAwayTeams = computed(() => {
    const homeId = this.model().homeTeamId;
    return this.teams().filter(t => t.id.toString() !== homeId);
  });

  constructor() {
    effect(() => {
      const match = this.match();
      if (match) {
        this.model.set({
          homeTeamId: match.homeTeamId.toString(),
          awayTeamId: match.awayTeamId.toString(),
          matchDate: this.formatDateForInput(match.matchDate),
          field: match.field
        });
      } else {
        this.model.set({ homeTeamId: '', awayTeamId: '', matchDate: '', field: '' });
      }
    });
  }

  private formatDateForInput(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  onSubmit(): void {
    this.matchForm.homeTeamId().markAsTouched();
    this.matchForm.awayTeamId().markAsTouched();
    this.matchForm.matchDate().markAsTouched();
    this.matchForm.field().markAsTouched();

    if (this.isValid()) {
      const m = this.model();
      const request: MatchRequest = {
        homeTeamId: Number(m.homeTeamId),
        awayTeamId: Number(m.awayTeamId),
        matchDate: new Date(m.matchDate).toISOString(),
        field: m.field
      };
      this.save.emit(request);
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

  getErrorMessage(field: 'homeTeamId' | 'awayTeamId' | 'matchDate' | 'field'): string {
    const fieldState = this.matchForm[field]();
    if (!fieldState.touched() || fieldState.valid()) return '';
    const errors = fieldState.errors();
    return errors.length > 0 ? (errors[0].message ?? errors[0].kind) : '';
  }

  hasError(field: 'homeTeamId' | 'awayTeamId' | 'matchDate' | 'field'): boolean {
    const fieldState = this.matchForm[field]();
    return fieldState.touched() && fieldState.invalid();
  }
}