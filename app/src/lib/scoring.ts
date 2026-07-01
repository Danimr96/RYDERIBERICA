import type { Edition, Hole, HoleResult, HoleScore, Player, Session } from './types'

/**
 * Motor de puntuación — Rider Ibérica (match play NETO)
 *
 * - Hándicap de juego (course handicap) = round(HI * Slope/113 + (CR - Par)), topado al máximo de la edición.
 * - Individual: allowance 100% del jugador.
 * - Dobles scramble: 35% del hándicap bajo + 15% del alto (estándar 2 jugadores).
 * - En cada partido el más bajo juega a 0 y el rival recibe la diferencia,
 *   repartida por los hoyos de menor stroke index.
 */

export function courseHandicap(hi: number | null, ed: Edition): number {
  if (hi == null) return 0
  const ch = Math.round(hi * (ed.course_slope / 113) + (ed.course_rating - ed.course_par))
  return Math.min(ch, ed.handicap_cap)
}

/** Hándicap de juego de un lado según formato. */
export function sidePlayingHandicap(players: Player[], session: Session, ed: Edition): number {
  const chs = players.map((p) => courseHandicap(p.handicap_index, ed))
  if (session.format === 'scramble_doubles' && chs.length === 2) {
    const low = Math.min(chs[0], chs[1])
    const high = Math.max(chs[0], chs[1])
    return Math.round(0.35 * low + 0.15 * high)
  }
  // Individual (o fallback): allowance sobre el jugador
  const base = chs[0] ?? 0
  return Math.round(base * (session.handicap_allowance ?? 1))
}

/** Golpes que recibe un lado en un hoyo, dado su total de golpes de match y el SI del hoyo. */
export function strokesOnHole(totalStrokes: number, strokeIndex: number): number {
  if (totalStrokes <= 0) return 0
  const base = Math.floor(totalStrokes / 18)
  const extra = totalStrokes % 18
  return base + (strokeIndex <= extra ? 1 : 0)
}

export interface HoleOutcome {
  hole: number
  winner: HoleResult | null
  netA: number | null
  netB: number | null
  strokesA: number
  strokesB: number
}

export interface MatchState {
  strokesTotalA: number
  strokesTotalB: number
  outcomes: HoleOutcome[]
  upA: number // holes-up desde el punto de vista de A (negativo = B arriba)
  thru: number
  holesRemaining: number
  closed: boolean
  finished: boolean
  winner: HoleResult | null // resultado final si finished
  /** puntos ya asegurados matemáticamente (dorm./cerrado o final) */
  points: { a: number; b: number }
  /** proyección en vivo: quién va ganando ahora mismo */
  projected: { a: number; b: number }
  label: string // '3&2', '2 UP', 'AS', 'DORMIE'...
  leaderSide: 'a' | 'b' | null
}

export function computeMatch(
  sideAPlayers: Player[],
  sideBPlayers: Player[],
  scores: HoleScore[],
  holes: Hole[],
  session: Session,
  ed: Edition,
): MatchState {
  const phA = sidePlayingHandicap(sideAPlayers, session, ed)
  const phB = sidePlayingHandicap(sideBPlayers, session, ed)
  const min = Math.min(phA, phB)
  const strokesTotalA = phA - min
  const strokesTotalB = phB - min

  const holeByNum = new Map(holes.map((h) => [h.number, h]))
  const scoreByNum = new Map(scores.map((s) => [s.hole_number, s]))

  const outcomes: HoleOutcome[] = []
  let upA = 0
  let thru = 0

  for (let n = 1; n <= 18; n++) {
    const h = holeByNum.get(n)
    if (!h) continue
    const sA = strokesOnHole(strokesTotalA, h.stroke_index)
    const sB = strokesOnHole(strokesTotalB, h.stroke_index)
    const sc = scoreByNum.get(n)

    let winner: HoleResult | null = null
    let netA: number | null = null
    let netB: number | null = null

    if (sc) {
      if (sc.winner) {
        winner = sc.winner
      } else if (sc.gross_a != null && sc.gross_b != null) {
        netA = sc.gross_a - sA
        netB = sc.gross_b - sB
        winner = netA < netB ? 'a' : netB < netA ? 'b' : 'halved'
      }
      if (winner) {
        thru = n
        if (winner === 'a') upA++
        else if (winner === 'b') upA--
      }
    }
    outcomes.push({ hole: n, winner, netA, netB, strokesA: sA, strokesB: sB })
  }

  const holesRemaining = 18 - thru
  const closed = Math.abs(upA) > holesRemaining && thru > 0
  const finished = closed || thru === 18
  const dormie = !closed && thru > 0 && Math.abs(upA) === holesRemaining && holesRemaining > 0

  let winner: HoleResult | null = null
  let label = 'AS'
  const leaderSide = upA > 0 ? 'a' : upA < 0 ? 'b' : null

  if (finished) {
    if (upA === 0) {
      winner = 'halved'
      label = 'EMPATE'
    } else {
      winner = upA > 0 ? 'a' : 'b'
      label = closed ? `${Math.abs(upA)}&${holesRemaining}` : `${Math.abs(upA)} UP`
    }
  } else if (thru > 0) {
    if (upA === 0) label = 'AS'
    else label = dormie ? `DORMIE ${Math.abs(upA)}` : `${Math.abs(upA)} UP`
  } else {
    label = '—'
  }

  const points = finished
    ? winner === 'halved'
      ? { a: 0.5, b: 0.5 }
      : winner === 'a'
        ? { a: 1, b: 0 }
        : { a: 0, b: 1 }
    : { a: 0, b: 0 }

  const projected = finished
    ? points
    : upA === 0
      ? { a: 0.5, b: 0.5 }
      : upA > 0
        ? { a: 1, b: 0 }
        : { a: 0, b: 1 }

  return {
    strokesTotalA,
    strokesTotalB,
    outcomes,
    upA,
    thru,
    holesRemaining,
    closed,
    finished,
    winner,
    points,
    projected,
    label,
    leaderSide,
  }
}
