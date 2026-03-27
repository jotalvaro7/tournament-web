import { Match } from '../../domain/models';

export interface MatchdayGroup {
  matchday: number | null;
  label: string;
  matches: Match[];
}
