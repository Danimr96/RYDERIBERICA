import { useState } from 'react'
import { useRider } from '../lib/store'
import MatchCard from '../components/MatchCard'

export default function Matches() {
  const { sessions, matches, states, loading } = useRider()
  const [tab, setTab] = useState<string>('all')

  if (loading) return <div className="p-4 text-sm text-white/40">Cargando…</div>

  const filtered = matches
    .filter((m) => tab === 'all' || m.session_id === tab)
    .sort((a, b) => a.number - b.number)

  return (
    <div className="p-4">
      <h1 className="mb-3 text-lg font-black">Partidos</h1>

      <div className="mb-4 flex gap-1 rounded-xl bg-card/60 p-1 text-xs font-bold">
        <Tab active={tab === 'all'} onClick={() => setTab('all')}>Todos</Tab>
        {sessions.map((s) => (
          <Tab key={s.id} active={tab === s.id} onClick={() => setTab(s.id)}>
            {s.day}
          </Tab>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line/60 bg-card/40 p-6 text-center text-sm text-white/40">
          Aún no hay partidos. Se sortean el viernes en la cena.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} state={states.get(m.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-1.5 transition ${active ? 'bg-gold text-ink' : 'text-white/50'}`}
    >
      {children}
    </button>
  )
}
