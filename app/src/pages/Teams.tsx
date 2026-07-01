import { Link } from 'react-router-dom'
import { useRider } from '../lib/store'
import { Avatar, TEAM_COLORS } from '../lib/ui'
import Honors from '../components/Honors'
import type { Player, TeamId } from '../lib/types'

export default function Teams() {
  const { players, teams, loading } = useRider()
  if (loading || !teams) return <div className="p-4 text-sm text-white/40">Cargando…</div>

  const order: TeamId[] = ['salcerdos', 'jamones']

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-lg font-black">Equipos</h1>
      {order.map((tid) => {
        const roster = players.filter((p) => p.team_id === tid).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        const c = TEAM_COLORS[tid]
        return (
          <section key={tid}>
            <div
              className="mb-3 flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: c.grad }}
            >
              <span className="text-2xl">{tid === 'salcerdos' ? '🔴' : '🔵'}</span>
              <div>
                <div className="text-lg font-black leading-none text-white">{teams[tid].name}</div>
                <div className="text-[11px] text-white/70">Capitán · {teams[tid].captain}</div>
              </div>
              <span className="ml-auto rounded-full bg-black/25 px-2.5 py-1 text-xs font-bold text-white">
                {roster.length} jugadores
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {roster.map((p) => (
                <PlayerCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function PlayerCard({ p }: { p: Player }) {
  const rec = p.is_rookie ? 'ROOKIE' : `${p.record_w}-${p.record_l}-${p.record_h}`
  return (
    <Link
      to={`/jugador/${p.id}`}
      className="flex items-center gap-2.5 rounded-2xl border border-line/60 bg-card/70 p-2.5 transition active:scale-[0.98]"
    >
      <Avatar player={p} size={44} />
      <div className="min-w-0">
        <div className="flex items-center gap-1 truncate text-sm font-bold">
          {p.alias}
          {p.is_captain && <span title="Capitán">🧢</span>}
          <Honors playerId={p.id} />
        </div>
        <div className="text-[10px] text-white/45">
          Hcp {p.handicap_index?.toString().replace('.', ',') ?? '—'}
        </div>
        <div className="text-[10px] font-semibold text-white/60">{rec}</div>
      </div>
    </Link>
  )
}
