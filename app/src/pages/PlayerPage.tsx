import { Link, useParams } from 'react-router-dom'
import { useRider } from '../lib/store'
import { courseHandicap } from '../lib/scoring'
import { Avatar, TEAM_COLORS, TEAM_LABEL } from '../lib/ui'
import Honors from '../components/Honors'

export default function PlayerPage() {
  const { id } = useParams()
  const { playersById, teams, edition, matches, states, loading } = useRider()
  if (loading) return <div className="p-4 text-sm text-white/40">Cargando…</div>

  const p = id ? playersById.get(id) : undefined
  if (!p || !teams || !edition) return <div className="p-4 text-sm text-white/40">Jugador no encontrado.</div>

  const c = TEAM_COLORS[p.team_id]
  const ch = courseHandicap(p.handicap_index, edition)
  const rec = p.is_rookie ? 'ROOKIE' : `${p.record_w}-${p.record_l}-${p.record_h}`

  // partidos del jugador
  const mine = matches.filter(
    (m) => m.sideA.players.some((x) => x.id === p.id) || m.sideB.players.some((x) => x.id === p.id),
  )

  return (
    <div className="pb-6">
      <div className="relative px-4 pt-6 pb-4 text-center" style={{ background: c.grad }}>
        <Link to="/equipos" className="absolute left-4 top-4 text-white/80">‹ Equipos</Link>
        <div className="mx-auto w-fit">
          <Avatar player={p} size={110} ring={false} />
        </div>
        <div className="mt-3 text-2xl font-black text-white">{p.full_name}</div>
        <div className="text-sm text-white/80">
          {TEAM_LABEL[p.team_id]} {p.is_captain && '· Capitán 🧢'}
        </div>
        <div className="mt-2 flex justify-center">
          <Honors playerId={p.id} compact={false} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pt-4">
        <Stat label="Hándicap" value={p.handicap_index?.toString().replace('.', ',') ?? '—'} />
        <Stat label="Juego (neto)" value={String(ch)} />
        <Stat label="Récord V-D-E" value={rec} />
      </div>

      <div className="px-4 pt-5">
        <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide">Sus partidos</h2>
        {mine.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line/60 bg-card/40 p-5 text-center text-xs text-white/40">
            Todavía sin partidos asignados.
          </div>
        ) : (
          <div className="space-y-2">
            {mine.map((m) => {
              const st = states.get(m.id)
              return (
                <Link
                  key={m.id}
                  to={`/partido/${m.id}`}
                  className="flex items-center justify-between rounded-xl border border-line/60 bg-card/70 px-3 py-2 text-sm"
                >
                  <span className="font-semibold">
                    {m.session.day} · Partido {m.number}
                  </span>
                  <span className="tnum font-bold text-white/70">{st?.label ?? '—'}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/60 bg-card/70 p-3 text-center">
      <div className="tnum text-lg font-black">{value}</div>
      <div className="text-[10px] text-white/45">{label}</div>
    </div>
  )
}
