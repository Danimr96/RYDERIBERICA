import { motion } from 'framer-motion'
import { useRider } from '../lib/store'
import { Avatar } from '../lib/ui'
import type { Player } from '../lib/types'

export default function Draw() {
  const { sessions, matches, loading } = useRider()
  if (loading) return <div className="p-4 text-sm text-white/40">Cargando…</div>

  return (
    <div className="p-4">
      <h1 className="text-lg font-black">Sorteo de partidos</h1>
      <p className="mt-1 text-xs text-white/45">
        Los emparejamientos se sortean en la cena del viernes. Aquí se revelan y luego se juegan.
      </p>

      {sessions.map((s) => {
        const ms = matches.filter((m) => m.session_id === s.id).sort((a, b) => a.number - b.number)
        return (
          <section key={s.id} className="mt-5">
            <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide">
              {s.day} · {s.name}
            </h2>
            {ms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line/60 bg-card/40 p-6 text-center text-xs text-white/40">
                🎲 Pendiente de sorteo
              </div>
            ) : (
              <div className="space-y-2">
                {ms.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-2 rounded-2xl border border-line/60 bg-card/70 p-3"
                  >
                    <span className="w-6 text-center text-xs font-black text-white/40">{m.number}</span>
                    <Side players={m.sideA.players} align="left" />
                    <span className="text-[10px] font-black text-white/30">VS</span>
                    <Side players={m.sideB.players} align="right" />
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function Side({ players, align }: { players: Player[]; align: 'left' | 'right' }) {
  return (
    <div
      className="flex flex-1 items-center gap-1.5"
      style={{ flexDirection: align === 'right' ? 'row-reverse' : 'row' }}
    >
      <div className="flex -space-x-2">
        {players.map((p) => (
          <Avatar key={p.id} player={p} size={30} />
        ))}
      </div>
      <div className={`text-xs font-bold ${align === 'right' ? 'text-right' : 'text-left'}`}>
        {players.map((p) => (
          <div key={p.id} className="truncate">{p.alias}</div>
        ))}
      </div>
    </div>
  )
}
