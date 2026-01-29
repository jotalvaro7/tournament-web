import { Component, ChangeDetectionStrategy, input, output, signal, computed, effect } from '@angular/core';
import { form, required, min, FormField } from '@angular/forms/signals';
import { Match, FinishMatchRequest } from '../../../domain/models';
import { Team } from '@app/features/teams/domain/models';

@Component({
  selector: 'app-match-result-modal',
  standalone: true,
  imports: [FormField],
  templateUrl: './match-result-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchResultModalComponent {
  match = input.required<Match>();
  teams = input<Team[]>([]);
  save = output<FinishMatchRequest>();
  close = output<void>();

  readonly model = signal({ homeTeamScore: 0, awayTeamScore: 0 });

  readonly resultForm = form(this.model, (f) => {
    required(f.homeTeamScore, { message: 'Score is required' });
    min(f.homeTeamScore, 0, { message: 'Score must be 0 or greater' });
    required(f.awayTeamScore, { message: 'Score is required' });
    min(f.awayTeamScore, 0, { message: 'Score must be 0 or greater' });
  });

  readonly isValid = computed(() => this.resultForm().valid());

  readonly homeTeamName = computed(() => {
    const m = this.match();
    const team = this.teams().find(t => t.id === m.homeTeamId);
    return team?.name ?? 'Home';
  });

  readonly awayTeamName = computed(() => {
    const m = this.match();
    const team = this.teams().find(t => t.id === m.awayTeamId);
    return team?.name ?? 'Away';
  });

  constructor() {
    effect(() => {
      const match = this.match();
      this.model.set({
        homeTeamScore: match.homeTeamScore ?? 0,
        awayTeamScore: match.awayTeamScore ?? 0
      });
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.resultForm.homeTeamScore().markAsTouched();
    this.resultForm.awayTeamScore().markAsTouched();

    if (this.isValid()) {
      this.save.emit(this.model() as FinishMatchRequest);
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

  hasError(field: 'homeTeamScore' | 'awayTeamScore'): boolean {
    const fieldState = this.resultForm[field]();
    return fieldState.touched() && fieldState.invalid();
  }

  getErrorMessage(field: 'homeTeamScore' | 'awayTeamScore'): string {
    const fieldState = this.resultForm[field]();
    if (!fieldState.touched() || fieldState.valid()) return '';
    const errors = fieldState.errors();
    return errors.length > 0 ? (errors[0].message ?? errors[0].kind) : '';
  }
}