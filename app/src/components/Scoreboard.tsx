import { motion } from 'framer-motion'
import { useRider } from '../lib/store'
import { TEAM_COLORS, fmtPts } from '../lib/ui'

/**
 * Marcador principal estilo Ryder Cup: "tira y afloja" entre los dos equipos.
 * Muestra los puntos EN VIVO (proyección) y, debajo, los ya asegurados.
 */
export default function Scoreboard() {
  const { edition, teams, score, live } = useRider()
  if (!edition || !teams) return null

  const total = edition.total_match_points + edition.jamones_bonus + edition.salcerdos_bonus
  const toWin = edition.points_to_win
  const sal = TEAM_COLORS.salcerdos
  const jam = TEAM_COLORS.jamones

  const leftFrac = Math.min(1, live.salcerdos / total)
  const rightFrac = Math.min(1, live.jamones / total)
  const winMarker = (toWin / total) * 100

  const leader =
    live.salcerdos > live.jamones ? 'salcerdos' : live.jamones > live.salcerdos ? 'jamones' : null

  return (
    <div className="px-4 pt-4">
      <div className="overflow-hidden rounded-3xl border border-line/70 bg-gradient-to-b from-card to-ink-2 shadow-2xl">
        {/* Cabecera equipos + marcadores grandes */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 pt-5">
          <TeamHead side="left" name="Salcerdos" captain={teams.salcerdos.captain} color={sal.main} />
          <div className="text-center text-[10px] font-bold uppercase tracking-widest text-white/35">
            vs
          </div>
          <TeamHead side="right" name="Jamones" captain={teams.jamones.captain} color={jam.main} />
        </div>

        <div className="grid grid-cols-2 items-end px-4 pb-3 pt-1">
          <div className="text-left">
            <span className="tnum text-6xl font-black leading-none" style={{ color: sal.main }}>
              {fmtPts(live.salcerdos)}
            </span>
          </div>
          <div className="text-right">
            <span className="tnum text-6xl font-black leading-none" style={{ color: jam.main }}>
              {fmtPts(live.jamones)}
            </span>
          </div>
        </div>

        {/* Barra tira y afloja */}
        <div className="relative mx-4 mb-2 h-7 overflow-hidden rounded-full bg-black/40 ring-1 ring-white/5">
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{ background: sal.grad }}
            animate={{ width: `${leftFrac * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
          <motion.div
            className="absolute inset-y-0 right-0"
            style={{ background: jam.grad }}
            animate={{ width: `${rightFrac * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
          {/* Línea de victoria */}
          <div
            className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-gold shadow-[0_0_8px_2px_rgba(255,210,31,0.6)]"
            style={{ left: `${winMarker}%` }}
          />
          <div
            className="absolute -top-0.5 z-10 -translate-x-1/2 text-[9px]"
            style={{ left: `${winMarker}%` }}
          >
            🏆
          </div>
        </div>

        {/* Pie: asegurados + objetivo */}
        <div className="flex items-center justify-between px-4 pb-4 text-[11px] font-semibold text-white/50">
          <span>Asegurados: <b className="text-white/80">{fmtPts(score.salcerdos)}</b></span>
          <span className="rounded-full bg-gold/15 px-2 py-0.5 font-bold text-gold">
            {fmtPts(toWin)} para ganar
          </span>
          <span><b className="text-white/80">{fmtPts(score.jamones)}</b> :asegurados</span>
        </div>
      </div>

      {/* Nota bonus + líder */}
      <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-white/45">
        <span>Jamones parten con +{fmtPts(edition.jamones_bonus)} (torneos)</span>
        {leader && (
          <span
            className="rounded-full px-2 py-0.5 font-bold"
            style={{ background: `${TEAM_COLORS[leader].main}22`, color: TEAM_COLORS[leader].main }}
          >
            {leader === 'salcerdos' ? 'Salcerdos' : 'Jamones'} al frente
          </span>
        )}
      </div>
    </div>
  )
}

function TeamHead({
  name,
  captain,
  color,
  side,
}: {
  name: string
  captain: string
  color: string
  side: 'left' | 'right'
}) {
  return (
    <div className={side === 'right' ? 'text-right' : 'text-left'}>
      <div className="flex items-center gap-2" style={{ flexDirection: side === 'right' ? 'row-reverse' : 'row' }}>
        <span className="size-3 rounded-full" style={{ background: color }} />
        <span className="text-base font-extrabold">{name}</span>
      </div>
      <div className="text-[11px] text-white/40">Cap. {captain}</div>
    </div>
  )
}
