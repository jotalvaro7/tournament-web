import { MatchStatus } from './match-status.enum';

/**
 * Match Request DTO
 *
 * Data structure for creating/updating matches
 */
export interface MatchRequest {
  homeTeamId: number;
  awayTeamId: number;
  matchDate: string; // ISO 8601 format
  field: string;
}

/**
 * Match Response DTO
 *
 * Data structure received from API
 */
export interface MatchResponse {
  id: number;
  tournamentId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  matchDate: string; // ISO 8601 format
  field: string;
  status: MatchStatus;
}

/**
 * Finish Match Request DTO
 *
 * Data structure for setting match result
 * Can be used to set or update scores (even for finished matches)
 */
export interface FinishMatchRequest {
  homeTeamScore: number;
  awayTeamScore: number;
}

/**
 * Match Filter Parameters
 *
 * Query parameters for filtering and paginating matches
 */
export interface MatchFilterParams {
  specificDate?: string;        // Format: YYYY-MM-DD
  dateFrom?: string;            // Format: YYYY-MM-DD
  dateTo?: string;              // Format: YYYY-MM-DD
  status?: MatchStatus;
  page?: number;                // Zero-based
  size?: number;                // 1-100, default 15
  sortBy?: string;              // Default: matchDate
  direction?: 'ASC' | 'DESC';   // Default: ASC
}

/**
 * Paginated Response for Matches
 *
 * Contains match list and pagination metadata
 */
export interface PageResponseMatch {
  content: MatchResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}
