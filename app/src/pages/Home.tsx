import { useRider } from '../lib/store'
import Scoreboard from '../components/Scoreboard'
import MatchCard from '../components/MatchCard'

export default function Home() {
  const { loading, sessions, matches, states } = useRider()

  if (loading) return <Loading />

  return (
    <div className="space-y-5">
      <Scoreboard />

      {sessions.map((s) => {
        const ms = matches.filter((m) => m.session_id === s.id).sort((a, b) => a.number - b.number)
        return (
          <section key={s.id} className="px-4">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wide">
                {s.day} · {s.name}
              </h2>
              <span className="text-[11px] text-white/40">
                {s.format === 'scramble_doubles' ? 'Dobles · 5 pts' : 'Individual · 10 pts'}
              </span>
            </div>
            {ms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line/60 bg-card/40 p-5 text-center text-xs text-white/40">
                Partidos por sortear. Se definen en la cena del viernes 🎲
              </div>
            ) : (
              <div className="space-y-2">
                {ms.map((m) => (
                  <MatchCard key={m.id} match={m} state={states.get(m.id)} />
                ))}
              </div>
            )}
          </section>
        )
      })}

      <p className="px-4 pb-2 text-center text-[10px] text-white/25">
        Rider Ibérica · Málaga 2026 · hecho con 🐷 y ⛳
      </p>
    </div>
  )
}

function Loading() {
  return (
    <div className="space-y-3 p-4">
      <div className="h-52 animate-pulse rounded-3xl bg-card/60" />
      <div className="h-24 animate-pulse rounded-2xl bg-card/40" />
      <div className="h-24 animate-pulse rounded-2xl bg-card/40" />
    </div>
  )
}
