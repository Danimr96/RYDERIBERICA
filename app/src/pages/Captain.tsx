import { useEffect, useState } from 'react'
import { useRider } from '../lib/store'
import { useIdentity } from '../lib/identity'
import { supabase } from '../lib/supabase'
import { sidePlayingHandicap } from '../lib/scoring'
import { Avatar, TEAM_COLORS, TEAM_LABEL } from '../lib/ui'
import type { Player, Side, TeamId } from '../lib/types'

/** Convención fija de lados: Salcerdos 🔴 = lado A · Jamones 🔵 = lado B. */
const SIDE_OF: Record<TeamId, Side> = { salcerdos: 'a', jamones: 'b' }
const TEAMS: TeamId[] = ['salcerdos', 'jamones']

/**
 * Panel de gestión — crear/editar partidos metiendo la alineación de un equipo.
 * - Capitán: solo su equipo.
 * - Admin (Dani): ambos equipos (con selector).
 * El partido queda completo cuando ambos lados tienen alineación.
 */
export default function Captain() {
  const { edition, sessions, players, playersById, matches, loading, refetch } = useRider()
  const { me, isAdmin } = useIdentity()

  const [sessionId, setSessionId] = useState<string>('')
  const [teamTab, setTeamTab] = useState<TeamId>('salcerdos')
  const [lineup, setLineup] = useState<string[][]>([]) // por hueco: playerIds del lado activo
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // Equipo activo: admin elige con el selector; capitán es el suyo fijo.
  const activeTeam: TeamId | undefined = isAdmin ? teamTab : me?.team_id
  const session = sessions.find((s) => s.id === sessionId) ?? sessions[0]
  const perSide = session?.format === 'scramble_doubles' ? 2 : 1
  const teamPlayers = activeTeam
    ? players
        .filter((p) => p.team_id === activeTeam)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    : []
  const nSlots = Math.max(1, Math.ceil(teamPlayers.length / perSide))

  // Al cambiar de sesión o de equipo activo, reconstruye el borrador desde lo guardado en BD.
  useEffect(() => {
    if (!session || !activeTeam) return
    const side = SIDE_OF[activeTeam]
    const slots: string[][] = Array.from({ length: nSlots }, () => [])
    for (const m of matches.filter((mm) => mm.session_id === session.id)) {
      const idx = m.number - 1
      if (idx < 0 || idx >= nSlots) continue
      const mine = side === 'a' ? m.sideA : m.sideB
      slots[idx] = mine.players.map((p) => p.id)
    }
    setLineup(slots)
    setMsg(null)
    // Deps a propósito solo sesión/equipo: no re-sincronizamos con cada update de `matches`
    // (realtime) para no pisar la alineación que se está editando.
  }, [session?.id, activeTeam])

  if (loading || !edition) return <div className="p-4 text-sm text-white/40">Cargando…</div>
  if (!me || (!me.is_captain && !me.is_admin) || !session || !activeTeam) {
    return (
      <div className="p-6 text-center text-sm text-white/50">
        🔒 Solo capitanes o admin pueden crear partidos.
      </div>
    )
  }

  const side = SIDE_OF[activeTeam]
  const c = TEAM_COLORS[activeTeam]

  // jugadores del equipo ya usados en otros huecos (para no repetir)
  const usedElsewhere = (slotIdx: number, pos: number) => {
    const used = new Set<string>()
    lineup.forEach((slot, i) =>
      slot.forEach((pid, j) => {
        if ((i !== slotIdx || j !== pos) && pid) used.add(pid)
      }),
    )
    return used
  }

  const setPick = (slotIdx: number, pos: number, playerId: string) => {
    setLineup((prev) => {
      const next = prev.map((s) => [...s])
      while (next.length < nSlots) next.push([])
      next[slotIdx][pos] = playerId
      return next
    })
    setMsg(null)
  }

  const oppPlayersOf = (slotIdx: number): Player[] => {
    const m = matches.find((mm) => mm.session_id === session.id && mm.number === slotIdx + 1)
    if (!m) return []
    const opp = side === 'a' ? m.sideB : m.sideA
    return opp.players
  }

  async function ensureMatch(sid: string, number: number): Promise<string> {
    const { data } = await supabase
      .from('match')
      .select('id')
      .eq('session_id', sid)
      .eq('number', number)
      .maybeSingle()
    if (data) return data.id
    const { data: created, error } = await supabase
      .from('match')
      .insert({ session_id: sid, number, status: 'scheduled', points_a: 0, points_b: 0, thru: 0 })
      .select('id')
      .single()
    if (error || !created) {
      const { data: again } = await supabase
        .from('match')
        .select('id')
        .eq('session_id', sid)
        .eq('number', number)
        .maybeSingle()
      if (again) return again.id
      throw error ?? new Error('No se pudo crear el partido')
    }
    return created.id
  }

  async function ensureSide(matchId: string, s: Side, teamId: TeamId): Promise<string> {
    const { data } = await supabase
      .from('match_side')
      .select('id')
      .eq('match_id', matchId)
      .eq('side', s)
      .maybeSingle()
    if (data) return data.id
    const { data: created, error } = await supabase
      .from('match_side')
      .insert({ match_id: matchId, side: s, team_id: teamId, playing_handicap: null })
      .select('id')
      .single()
    if (error || !created) {
      const { data: again } = await supabase
        .from('match_side')
        .select('id')
        .eq('match_id', matchId)
        .eq('side', s)
        .maybeSingle()
      if (again) return again.id
      throw error ?? new Error('No se pudo crear el lado')
    }
    return created.id
  }

  async function save() {
    if (!session || !edition || !activeTeam) return
    setSaving(true)
    setMsg(null)
    try {
      const all = lineup.flat().filter(Boolean)
      if (new Set(all).size !== all.length) throw new Error('Hay un jugador repetido en dos partidos.')

      for (let i = 0; i < nSlots; i++) {
        const number = i + 1
        const ids = (lineup[i] ?? []).filter(Boolean)
        const existing = matches.find((m) => m.session_id === session.id && m.number === number)
        if (ids.length === 0 && !existing) continue
        if (ids.length > 0 && ids.length !== perSide) {
          throw new Error(`Partido ${number}: elige ${perSide} jugador${perSide > 1 ? 'es' : ''}.`)
        }
        const matchId = await ensureMatch(session.id, number)
        // ambos shells de lado, para que el partido tenga siempre lado A y B
        const aId = await ensureSide(matchId, 'a', 'salcerdos')
        const bId = await ensureSide(matchId, 'b', 'jamones')
        const activeSideId = side === 'a' ? aId : bId

        await supabase.from('match_player').delete().eq('match_side_id', activeSideId)
        if (ids.length === 0) {
          await supabase.from('match_side').update({ playing_handicap: null }).eq('id', activeSideId)
        } else {
          const sidePlayers = ids.map((id) => playersById.get(id)).filter((p): p is Player => !!p)
          const ph = sidePlayingHandicap(sidePlayers, session, edition)
          await supabase.from('match_side').update({ playing_handicap: ph }).eq('id', activeSideId)
          await supabase
            .from('match_player')
            .insert(ids.map((pid) => ({ match_side_id: activeSideId, player_id: pid })))
        }
      }
      await refetch()
      setMsg('✅ Alineación guardada.')
    } catch (e) {
      setMsg('⚠️ ' + (e instanceof Error ? e.message : 'Error al guardar'))
    } finally {
      setSaving(false)
    }
  }

  const completos = lineup.filter((s) => s.filter(Boolean).length === perSide).length

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-black">{isAdmin ? 'Panel de admin' : 'Panel de capitán'}</h1>
        {isAdmin ? (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/70">
            🛠️ admin
          </span>
        ) : (
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ background: `${c.main}22`, color: c.main }}
          >
            🧢 {TEAM_LABEL[activeTeam]}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-white/45">
        Mete la alineación {isAdmin ? 'de cada equipo' : 'de tu equipo'}. El partido se activa cuando
        ambos lados tienen jugadores.
      </p>

      {/* Selector de equipo (solo admin) */}
      {isAdmin && (
        <div className="mt-3 flex gap-2">
          {TEAMS.map((t) => {
            const active = t === activeTeam
            const tc = TEAM_COLORS[t]
            return (
              <button
                key={t}
                onClick={() => setTeamTab(t)}
                className="flex-1 rounded-2xl border px-3 py-2 text-sm font-black transition"
                style={{
                  borderColor: active ? tc.main : 'rgba(255,255,255,0.12)',
                  background: active ? `${tc.main}22` : 'transparent',
                  color: active ? tc.main : 'rgba(255,255,255,0.5)',
                }}
              >
                {TEAM_LABEL[t]}
              </button>
            )
          })}
        </div>
      )}

      {/* Selector de sesión */}
      <div className="mt-3 flex gap-2">
        {sessions.map((s) => {
          const active = s.id === session.id
          return (
            <button
              key={s.id}
              onClick={() => setSessionId(s.id)}
              className={`flex-1 rounded-2xl border px-3 py-2 text-left transition ${
                active ? 'border-gold/70 bg-card' : 'border-line/60 bg-card/50'
              }`}
            >
              <div className="text-xs font-black">{s.day}</div>
              <div className="text-[10px] text-white/50">
                {s.name} · {s.format === 'scramble_doubles' ? '2v2' : '1v1'}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-white/45">
        <span>
          {completos}/{nSlots} partidos con alineación
        </span>
        <span>
          {perSide === 2 ? 'Parejas (scramble)' : 'Individual'} · lado {side.toUpperCase()}
        </span>
      </div>

      {/* Huecos */}
      <div className="mt-2 space-y-2">
        {Array.from({ length: nSlots }, (_, i) => {
          const opp = oppPlayersOf(i)
          return (
            <div key={i} className="rounded-2xl border border-line/60 bg-card/70 p-3">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-white/40">
                Partido {i + 1}
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <div className="space-y-1.5">
                  {Array.from({ length: perSide }, (_, pos) => {
                    const value = lineup[i]?.[pos] ?? ''
                    const used = usedElsewhere(i, pos)
                    return (
                      <select
                        key={pos}
                        value={value}
                        onChange={(e) => setPick(i, pos, e.target.value)}
                        className="w-full rounded-lg border border-line/60 bg-ink/60 px-2 py-1.5 text-sm font-bold"
                        style={{ color: c.main }}
                      >
                        <option value="">— elegir jugador —</option>
                        {teamPlayers
                          .filter((p) => p.id === value || !used.has(p.id))
                          .map((p) => (
                            <option key={p.id} value={p.id} className="bg-ink text-white">
                              {p.alias}
                            </option>
                          ))}
                      </select>
                    )
                  })}
                </div>
                {/* Rival (solo lectura) */}
                <div className="min-w-[92px] text-right">
                  <div className="text-[9px] uppercase tracking-wide text-white/30">Rival</div>
                  {opp.length ? (
                    <div className="mt-0.5 flex flex-col items-end gap-1">
                      {opp.map((p) => (
                        <div key={p.id} className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white/80">{p.alias}</span>
                          <Avatar player={p} size={22} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 text-[10px] text-white/30">por definir</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {msg && (
        <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-center text-xs text-white/80">
          {msg}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="mt-4 w-full rounded-2xl bg-gold py-3 text-sm font-black text-ink disabled:opacity-50"
      >
        {saving ? 'Guardando…' : `Guardar alineación · ${TEAM_LABEL[activeTeam]}`}
      </button>
    </div>
  )
}
