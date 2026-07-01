import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRider } from '../lib/store'
import { useIdentity } from '../lib/identity'
import { supabase } from '../lib/supabase'
import { computeMatch } from '../lib/scoring'
import { Avatar, TEAM_COLORS, fmtPts } from '../lib/ui'
import Honors from '../components/Honors'
import type { HoleScore, MatchFull } from '../lib/types'

export default function MatchEntry() {
  const { id } = useParams()
  const { matches, holes, edition, teams, loading, refetch } = useRider()
  const { canScore, me } = useIdentity()
  const [saving, setSaving] = useState<number | null>(null)

  const match = useMemo(() => matches.find((m) => m.id === id), [matches, id])

  if (loading) return <div className="p-4 text-sm text-white/40">Cargando…</div>
  if (!match || !edition || !teams) return <div className="p-4 text-sm text-white/40">Partido no encontrado.</div>

  const playerIds = [...match.sideA.players, ...match.sideB.players].map((p) => p.id)
  const canEdit = canScore(playerIds)
  const aColor = TEAM_COLORS[match.sideA.side.team_id].main
  const bColor = TEAM_COLORS[match.sideB.side.team_id].main
  const st = computeMatch(match.sideA.players, match.sideB.players, match.scores, holes, match.session, edition)
  const scoreByHole = new Map(match.scores.map((s) => [s.hole_number, s]))

  async function setGross(holeNumber: number, side: 'a' | 'b', value: number | null) {
    if (!match || !edition || !canEdit) return
    setSaving(holeNumber)
    const existing = scoreByHole.get(holeNumber)
    const row = {
      match_id: match.id,
      hole_number: holeNumber,
      gross_a: side === 'a' ? value : existing?.gross_a ?? null,
      gross_b: side === 'b' ? value : existing?.gross_b ?? null,
      winner: null,
      updated_at: new Date().toISOString(),
    }
    await supabase.from('hole_score').upsert(row, { onConflict: 'match_id,hole_number' })

    // Recalcular estado con el nuevo dato y persistir en la fila del partido
    const nextScores: HoleScore[] = [
      ...match.scores.filter((s) => s.hole_number !== holeNumber),
      { id: existing?.id ?? crypto.randomUUID(), ...row } as HoleScore,
    ]
    const ns = computeMatch(match.sideA.players, match.sideB.players, nextScores, holes, match.session, edition)
    await supabase
      .from('match')
      .update({
        status: ns.finished ? 'finished' : ns.thru > 0 ? 'live' : 'scheduled',
        winner: ns.finished ? ns.winner : null,
        points_a: ns.points.a,
        points_b: ns.points.b,
        thru: ns.thru,
        state_label: ns.label,
        updated_at: new Date().toISOString(),
      })
      .eq('id', match.id)

    await refetch()
    setSaving(null)
  }

  return (
    <div className="pb-8">
      {/* Cabecera */}
      <div className="border-b border-line/60 bg-ink-2/60 px-4 py-3">
        <Link to="/partidos" className="text-xs text-white/50">‹ Partidos</Link>
        <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white/40">
          {match.session.day} · {match.session.name} · Partido {match.number}
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <SidePanel m={match} side="a" color={aColor} strokes={st.strokesTotalA} align="left" />
          <div className="text-center">
            <div
              className="rounded-lg px-2 py-1 text-lg font-black tnum"
              style={{
                background: st.leaderSide ? `${st.leaderSide === 'a' ? aColor : bColor}22` : 'rgba(255,255,255,0.06)',
                color: st.leaderSide ? (st.leaderSide === 'a' ? aColor : bColor) : '#fff',
              }}
            >
              {st.label}
            </div>
            <div className="mt-0.5 text-[10px] text-white/40">
              {st.finished ? 'Final' : st.thru > 0 ? `Hoyo ${st.thru}` : 'Sin empezar'}
            </div>
          </div>
          <SidePanel m={match} side="b" color={bColor} strokes={st.strokesTotalB} align="right" />
        </div>

        <div className="mt-2 text-center text-[11px] text-white/45">
          Proyección: <b style={{ color: aColor }}>{fmtPts(st.projected.a)}</b>
          {' · '}
          <b style={{ color: bColor }}>{fmtPts(st.projected.b)}</b>
        </div>
      </div>

      {/* Hoyos */}
      <div className="p-3">
        {!canEdit && (
          <div className="mb-3 rounded-xl border border-line/60 bg-white/5 px-3 py-2 text-[11px] text-white/55">
            👀 Modo lectura. Solo los jugadores de este partido o un capitán pueden puntuar
            {me ? ` (estás como ${me.alias})` : ' (estás como espectador)'}.
          </div>
        )}
        <div className="mb-2 grid grid-cols-[2.2rem_1fr_1fr_2.6rem] items-center gap-2 px-1 text-[10px] font-bold uppercase text-white/35">
          <span>Hoyo</span>
          <span className="text-center">Salcerdos</span>
          <span className="text-center">Jamones</span>
          <span className="text-right">Neto</span>
        </div>
        <div className="space-y-1.5">
          {holes.map((h) => {
            const sc = scoreByHole.get(h.number)
            const oc = st.outcomes.find((o) => o.hole === h.number)
            const aTeamLeft = match.sideA.side.team_id === 'salcerdos'
            // columna izquierda siempre Salcerdos, derecha Jamones
            const leftIsA = aTeamLeft
            const leftGross = leftIsA ? sc?.gross_a ?? null : sc?.gross_b ?? null
            const rightGross = leftIsA ? sc?.gross_b ?? null : sc?.gross_a ?? null
            const leftStrokes = leftIsA ? oc?.strokesA ?? 0 : oc?.strokesB ?? 0
            const rightStrokes = leftIsA ? oc?.strokesB ?? 0 : oc?.strokesA ?? 0
            const winnerTeam =
              oc?.winner === 'a' ? match.sideA.side.team_id : oc?.winner === 'b' ? match.sideB.side.team_id : oc?.winner === 'halved' ? 'halved' : null

            return (
              <div
                key={h.number}
                className={`grid grid-cols-[2.2rem_1fr_1fr_2.6rem] items-center gap-2 rounded-xl border p-1.5 ${
                  saving === h.number ? 'border-gold/40' : 'border-line/50'
                } bg-card/60`}
              >
                <div className="text-center">
                  <div className="text-sm font-black tnum">{h.number}</div>
                  <div className="text-[9px] text-white/35">Par{h.par}·SI{h.stroke_index}</div>
                </div>
                <Stepper
                  value={leftGross}
                  par={h.par}
                  strokes={leftStrokes}
                  color={TEAM_COLORS.salcerdos.main}
                  readOnly={!canEdit}
                  onChange={(v) => setGross(h.number, leftIsA ? 'a' : 'b', v)}
                />
                <Stepper
                  value={rightGross}
                  par={h.par}
                  strokes={rightStrokes}
                  color={TEAM_COLORS.jamones.main}
                  readOnly={!canEdit}
                  onChange={(v) => setGross(h.number, leftIsA ? 'b' : 'a', v)}
                />
                <div className="text-right">
                  {winnerTeam === 'halved' ? (
                    <span className="text-[10px] font-bold text-white/50">AS</span>
                  ) : winnerTeam ? (
                    <span
                      className="text-[10px] font-black"
                      style={{ color: TEAM_COLORS[winnerTeam].main }}
                    >
                      {winnerTeam === 'salcerdos' ? '🔴' : '🔵'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/20">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-3 px-1 text-center text-[10px] text-white/30">
          Mete el golpe bruto de cada lado; el neto se calcula solo con el stroke index del Parador.
          Los puntitos = golpes que recibe ese lado en el hoyo.
        </p>
      </div>
    </div>
  )
}

function SidePanel({
  m,
  side,
  color,
  strokes,
  align,
}: {
  m: MatchFull
  side: 'a' | 'b'
  color: string
  strokes: number
  align: 'left' | 'right'
}) {
  const players = side === 'a' ? m.sideA.players : m.sideB.players
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div className="flex items-center gap-1.5" style={{ flexDirection: align === 'right' ? 'row-reverse' : 'row' }}>
        <div className="flex -space-x-2">
          {players.map((p) => (
            <Avatar key={p.id} player={p} size={30} />
          ))}
        </div>
      </div>
      <div className="mt-1 text-xs font-bold leading-tight">
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-1 truncate"
            style={{ flexDirection: align === 'right' ? 'row-reverse' : 'row' }}
          >
            <span className="truncate">{p.alias}</span>
            <Honors playerId={p.id} />
          </div>
        ))}
      </div>
      <div className="text-[10px] font-semibold" style={{ color }}>
        {strokes > 0 ? `recibe ${strokes} golpe${strokes > 1 ? 's' : ''}` : 'scratch'}
      </div>
    </div>
  )
}

function Stepper({
  value,
  par,
  strokes,
  color,
  readOnly = false,
  onChange,
}: {
  value: number | null
  par: number
  strokes: number
  color: string
  readOnly?: boolean
  onChange: (v: number | null) => void
}) {
  const v = value ?? par
  const dots = strokes > 0 && (
    <div className="absolute -right-0.5 -top-1 flex gap-0.5">
      {Array.from({ length: strokes }).map((_, i) => (
        <span key={i} className="size-1.5 rounded-full" style={{ background: color }} />
      ))}
    </div>
  )

  if (readOnly) {
    return (
      <div className="flex items-center justify-center">
        <div className="relative w-9 text-center">
          <div className={`tnum text-lg font-black ${value == null ? 'text-white/25' : ''}`}>
            {value == null ? '–' : v}
          </div>
          {dots}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, v - 1))}
        className="grid size-7 place-items-center rounded-lg bg-white/5 text-base font-bold text-white/70 active:scale-90"
      >
        −
      </button>
      <div className="relative w-9 text-center">
        <div className={`tnum text-lg font-black ${value == null ? 'text-white/30' : ''}`}>{v}</div>
        {dots}
      </div>
      <button
        onClick={() => onChange(v + 1)}
        className="grid size-7 place-items-center rounded-lg bg-white/5 text-base font-bold text-white/70 active:scale-90"
      >
        +
      </button>
    </div>
  )
}
