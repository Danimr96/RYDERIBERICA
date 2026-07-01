import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from './supabase'
import { computeMatch } from './scoring'
import type { MatchState } from './scoring'
import type {
  Edition, Team, Player, Hole, Session, Match, MatchSide, MatchPlayer, HoleScore, MatchFull, TeamId,
  Tournament, Title, PlayerHonor,
} from './types'

interface RiderData {
  loading: boolean
  error: string | null
  edition: Edition | null
  teams: Record<TeamId, Team> | null
  players: Player[]
  playersById: Map<string, Player>
  holes: Hole[]
  sessions: Session[]
  matches: MatchFull[]
  states: Map<string, MatchState>
  tournaments: Tournament[]
  titles: Title[]
  honorsByPlayer: Map<string, PlayerHonor[]>
  score: { salcerdos: number; jamones: number } // asegurado (incluye bonus)
  live: { salcerdos: number; jamones: number } // proyección en vivo (incluye bonus)
  refetch: () => Promise<void>
}

const Ctx = createContext<RiderData | null>(null)

export function RiderProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [edition, setEdition] = useState<Edition | null>(null)
  const [teams, setTeams] = useState<Record<TeamId, Team> | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [holes, setHoles] = useState<Hole[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [matches, setMatches] = useState<MatchFull[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [titles, setTitles] = useState<Title[]>([])
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      const [ed, tm, pl, ho, se, ma, ms, mp, hs, tn, ti] = await Promise.all([
        supabase.from('edition').select('*').eq('id', 1).maybeSingle(),
        supabase.from('team').select('*'),
        supabase.from('player').select('*').order('sort_order'),
        supabase.from('hole').select('*').order('number'),
        supabase.from('session').select('*').order('sort_order'),
        supabase.from('match').select('*').order('number'),
        supabase.from('match_side').select('*'),
        supabase.from('match_player').select('*'),
        supabase.from('hole_score').select('*'),
        supabase.from('tournament').select('*').order('sort_order'),
        supabase.from('title').select('*'),
      ])

      const anyErr = [ed, tm, pl, ho, se, ma, ms, mp, hs, tn, ti].find((r) => r.error)
      if (anyErr?.error) throw anyErr.error

      const teamsObj = {} as Record<TeamId, Team>
      ;(tm.data as Team[]).forEach((t) => (teamsObj[t.id] = t))

      const playersArr = (pl.data as Player[]) ?? []
      const pById = new Map(playersArr.map((p) => [p.id, p]))
      const sessionsArr = (se.data as Session[]) ?? []
      const sById = new Map(sessionsArr.map((s) => [s.id, s]))
      const sides = (ms.data as MatchSide[]) ?? []
      const mplayers = (mp.data as MatchPlayer[]) ?? []
      const scores = (hs.data as HoleScore[]) ?? []

      const playersOfSide = (sideId: string) =>
        mplayers.filter((x) => x.match_side_id === sideId)
          .map((x) => pById.get(x.player_id))
          .filter((x): x is Player => !!x)

      const full: MatchFull[] = ((ma.data as Match[]) ?? []).map((m) => {
        const sA = sides.find((s) => s.match_id === m.id && s.side === 'a')
        const sB = sides.find((s) => s.match_id === m.id && s.side === 'b')
        return {
          ...m,
          session: sById.get(m.session_id)!,
          sideA: { side: sA!, players: sA ? playersOfSide(sA.id) : [] },
          sideB: { side: sB!, players: sB ? playersOfSide(sB.id) : [] },
          scores: scores.filter((s) => s.match_id === m.id),
        }
      })

      setEdition(ed.data as Edition)
      setTeams(teamsObj)
      setPlayers(playersArr)
      setHoles((ho.data as Hole[]) ?? [])
      setSessions(sessionsArr)
      setMatches(full)
      setTournaments((tn.data as Tournament[]) ?? [])
      setTitles((ti.data as Title[]) ?? [])
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const schedule = () => {
      if (debounce.current) clearTimeout(debounce.current)
      debounce.current = setTimeout(fetchAll, 250)
    }
    const ch = supabase
      .channel('rider-live')
      .on('postgres_changes', { event: '*', schema: 'public' }, schedule)
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [fetchAll])

  const states = useMemo(() => {
    const map = new Map<string, MatchState>()
    if (!edition) return map
    for (const m of matches) {
      map.set(m.id, computeMatch(m.sideA.players, m.sideB.players, m.scores, holes, m.session, edition))
    }
    return map
  }, [matches, holes, edition])

  const { score, live } = useMemo(() => {
    const secured = { salcerdos: 0, jamones: 0 }
    const proj = { salcerdos: 0, jamones: 0 }
    for (const m of matches) {
      const st = states.get(m.id)
      if (!st) continue
      const tA = m.sideA.side?.team_id
      const tB = m.sideB.side?.team_id
      if (!tA || !tB) continue
      secured[tA] += st.points.a
      secured[tB] += st.points.b
      proj[tA] += st.projected.a
      proj[tB] += st.projected.b
    }
    if (edition) {
      secured.jamones += edition.jamones_bonus
      secured.salcerdos += edition.salcerdos_bonus
      proj.jamones += edition.jamones_bonus
      proj.salcerdos += edition.salcerdos_bonus
    }
    return { score: secured, live: proj }
  }, [matches, states, edition])

  const honorsByPlayer = useMemo(() => {
    const tById = new Map(tournaments.map((t) => [t.id, t]))
    const map = new Map<string, PlayerHonor[]>()
    for (const t of titles) {
      if (!t.player_id) continue
      const tour = tById.get(t.tournament_id)
      if (!tour) continue
      const arr = map.get(t.player_id) ?? []
      let h = arr.find((x) => x.tournament.id === tour.id)
      if (!h) {
        h = { tournament: tour, count: 0, editions: [] }
        arr.push(h)
      }
      h.count++
      h.editions.push(t.edition_number)
      map.set(t.player_id, arr)
    }
    // ordenar insignias por sort_order del torneo
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.tournament.sort_order ?? 0) - (b.tournament.sort_order ?? 0))
      arr.forEach((h) => h.editions.sort((a, b) => a - b))
    }
    return map
  }, [titles, tournaments])

  const value: RiderData = {
    loading, error, edition, teams, players,
    playersById: useMemo(() => new Map(players.map((p) => [p.id, p])), [players]),
    holes, sessions, matches, states, tournaments, titles, honorsByPlayer,
    score, live, refetch: fetchAll,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useRider() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useRider debe usarse dentro de <RiderProvider>')
  return v
}
