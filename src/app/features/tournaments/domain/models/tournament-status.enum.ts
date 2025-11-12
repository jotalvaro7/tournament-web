/**
 * Tournament Status Enum
 *
 * Represents the lifecycle states of a tournament:
 * - CREATED: Initial state when tournament is created
 * - IN_PROGRESS: Tournament has started
 * - COMPLETED: Tournament has finished
 * - CANCELLED: Tournament was cancelled (can be cancelled from any state except COMPLETED)
 *
 * State transitions:
 * CREATED → IN_PROGRESS → COMPLETED
 * Any state (except COMPLETED) → CANCELLED
 */
export enum TournamentStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
