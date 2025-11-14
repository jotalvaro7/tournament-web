/**
 * Match Status Enum
 *
 * Represents the lifecycle states of a match
 *
 * State Machine:
 * SCHEDULED → FINISHED
 * SCHEDULED → POSTPONED
 * POSTPONED → SCHEDULED (via update)
 * FINISHED → FINISHED (can update scores if there was an error)
 *
 * Business Rules:
 * - Matches start in SCHEDULED state
 * - All matches can be updated (including FINISHED ones for error correction)
 * - Result can be modified even after match is FINISHED
 */
export enum MatchStatus {
  /** Match is scheduled and waiting to be played */
  SCHEDULED = 'SCHEDULED',

  /** Match has been completed with a final result (result can still be corrected) */
  FINISHED = 'FINISHED',

  /** Match has been postponed and needs rescheduling */
  POSTPONED = 'POSTPONED'
}
