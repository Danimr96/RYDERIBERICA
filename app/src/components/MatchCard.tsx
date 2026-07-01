import { Link } from 'react-router-dom'
import type { MatchFull } from '../lib/types'
import type { MatchState } from '../lib/scoring'
import { Avatar, TEAM_COLORS } from '../lib/ui'
import Honors from './Honors'

export default function MatchCard({ match, state }: { match: MatchFull; state?: MatchState }) {
  const sal = TEAM_COLORS.salcerdos
  const jam = TEAM_COLORS.jamones
  const aTeam = match.sideA.side?.team_id ?? 'salcerdos'
  const bTeam = match.sideB.side?.team_id ?? 'jamones'
  const aColor = TEAM_COLORS[aTeam].main
  const bColor = TEAM_COLORS[bTeam].main

  const live = match.status === 'live' || (state && state.thru > 0 && !state.finished)
  const finished = match.status === 'finished' || state?.finished

  const leader = state?.leaderSide ?? null
  const label = state?.label ?? '—'

  return (
    <Link
      to={`/partido/${match.id}`}
      className="block rounded-2xl border border-line/60 bg-card/80 p-3 transition active:scale-[0.99]"
    >
      <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-white/35">
        <span>Partido {match.number}</span>
        <span className="flex items-center gap-1">
          {live && <span className="live-dot size-1.5 rounded-full bg-emerald-400" />}
          {finished ? 'Final' : live ? `Hoyo ${state?.thru ?? 0}` : match.tee_time || 'Por jugar'}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <SideRow players={match.sideA.players} color={aColor} up={leader === 'a'} align="left" />

        <div className="flex flex-col items-center">
          <div
            className="min-w-[52px] rounded-lg px-2 py-1 text-center text-sm font-black tnum"
            style={{
              background: leader ? `${(leader === 'a' ? aColor : bColor)}22` : 'rgba(255,255,255,0.05)',
              color: leader ? (leader === 'a' ? aColor : bColor) : '#fff',
            }}
          >
            {label}
          </div>
        </div>

        <SideRow players={match.sideB.players} color={bColor} up={leader === 'b'} align="right" />
      </div>

      {/* franja de color */}
      <div className="mt-2 flex h-1 overflow-hidden rounded-full">
        <div className="flex-1" style={{ background: sal.main, opacity: aTeam === 'salcerdos' ? 1 : 0.25 }} />
        <div className="flex-1" style={{ background: jam.main, opacity: bTeam === 'jamones' ? 1 : 0.25 }} />
      </div>
    </Link>
  )
}

function SideRow({
  players,
  color,
  up,
  align,
}: {
  players: MatchFull['sideA']['players']
  color: string
  up: boolean
  align: 'left' | 'right'
}) {
  return (
    <div
      className="flex items-center gap-2"
      style={{ flexDirection: align === 'right' ? 'row-reverse' : 'row' }}
    >
      <div className="flex -space-x-2" style={{ flexDirection: align === 'right' ? 'row-reverse' : 'row' }}>
        {players.map((p) => (
          <Avatar key={p.id} player={p} size={34} />
        ))}
      </div>
      <div className={align === 'right' ? 'text-right' : 'text-left'}>
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-1 text-xs font-bold leading-tight"
            style={{ flexDirection: align === 'right' ? 'row-reverse' : 'row' }}
          >
            {up && <span style={{ color }}>{align === 'right' ? '◂' : '▸'}</span>}
            <span className="truncate">{p.alias}</span>
            <Honors playerId={p.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
