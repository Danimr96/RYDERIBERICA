export type TeamId = 'salcerdos' | 'jamones'
export type Side = 'a' | 'b'
export type HoleResult = 'a' | 'b' | 'halved'
export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface Edition {
  id: number
  number: number
  name: string
  venue: string
  course_name: string
  course_par: number
  course_slope: number
  course_rating: number
  handicap_cap: number
  defending_team: TeamId
  jamones_bonus: number
  salcerdos_bonus: number
  total_match_points: number
  points_to_win: number
  start_date: string | null
  access_code: string
}

export interface Tournament {
  id: string
  name: string
  short: string
  emoji: string
  color: string
  sort_order: number | null
}

export interface Title {
  id: string
  player_id: string | null
  tournament_id: string
  edition_number: number
  is_current: boolean
  note: string | null
  /** Campeón que no está en el roster actual (jugador pasado). */
  champion_name: string | null
  team_id: TeamId | null
}

/** Insignias agregadas de un jugador (por torneo). */
export interface PlayerHonor {
  tournament: Tournament
  count: number
  editions: number[]
}

export interface Team {
  id: TeamId
  name: string
  captain: string
  color: string
  accent: string | null
  emoji: string | null
}

export interface Player {
  id: string
  team_id: TeamId
  full_name: string
  alias: string
  handicap_index: number | null
  record_w: number
  record_l: number
  record_h: number
  is_rookie: boolean
  is_captain: boolean
  is_admin: boolean
  photo_url: string | null
  sort_order: number | null
}

export interface Hole {
  number: number
  par: number
  stroke_index: number
}

export interface Session {
  id: string
  name: string
  day: string
  format: 'scramble_doubles' | 'singles'
  handicap_allowance: number
  sort_order: number | null
  status: string
}

export interface Match {
  id: string
  session_id: string
  number: number
  status: MatchStatus
  winner: HoleResult | null
  points_a: number
  points_b: number
  thru: number
  state_label: string | null
  tee_time: string | null
  updated_at: string
}

export interface MatchSide {
  id: string
  match_id: string
  side: Side
  team_id: TeamId
  playing_handicap: number | null
}

export interface MatchPlayer {
  id: string
  match_side_id: string
  player_id: string
}

export interface HoleScore {
  id: string
  match_id: string
  hole_number: number
  gross_a: number | null
  gross_b: number | null
  winner: HoleResult | null
  updated_at: string
}

/** Partido con sus lados y jugadores resueltos, listo para pintar. */
export interface MatchFull extends Match {
  session: Session
  sideA: { side: MatchSide; players: Player[] }
  sideB: { side: MatchSide; players: Player[] }
  scores: HoleScore[]
}
