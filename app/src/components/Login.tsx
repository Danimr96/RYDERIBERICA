import { useState } from 'react'
import { useRider } from '../lib/store'
import { useIdentity } from '../lib/identity'
import { Avatar, TEAM_COLORS } from '../lib/ui'
import type { TeamId } from '../lib/types'

export default function Login() {
  const { players, teams } = useRider()
  const { unlocked, unlock, identify, spectate } = useIdentity()
  const [code, setCode] = useState('')
  const [err, setErr] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8">
        <div className="mb-6 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-gold to-amber-500 text-3xl shadow-xl">
            🏌️
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight">RIDER IBÉRICA</h1>
          <p className="text-xs text-white/50">Málaga 2026 · 6ª edición</p>
        </div>

        {!unlocked ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!unlock(code)) setErr(true)
            }}
            className="rounded-3xl border border-line/70 bg-card/70 p-5"
          >
            <label className="text-sm font-bold">Código de acceso</label>
            <p className="mb-3 text-xs text-white/45">El que ha compartido la organización.</p>
            <input
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setErr(false)
              }}
              placeholder="RIDER26"
              className={`w-full rounded-xl border bg-ink px-4 py-3 text-center text-lg font-black uppercase tracking-widest outline-none ${
                err ? 'border-red-500' : 'border-line'
              }`}
            />
            {err && <p className="mt-2 text-xs text-red-400">Código incorrecto</p>}
            <button className="mt-4 w-full rounded-xl bg-gold py-3 font-black text-ink active:scale-[0.99]">
              Entrar
            </button>
          </form>
        ) : (
          <div className="rounded-3xl border border-line/70 bg-card/70 p-4">
            <div className="mb-1 text-sm font-bold">¿Quién eres?</div>
            <p className="mb-3 text-xs text-white/45">
              Elige tu nombre para poder puntuar tus partidos.
            </p>
            <div className="space-y-4">
              {(['salcerdos', 'jamones'] as TeamId[]).map((tid) => (
                <div key={tid}>
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: TEAM_COLORS[tid].main }}>
                    <span className="size-2 rounded-full" style={{ background: TEAM_COLORS[tid].main }} />
                    {teams?.[tid].name}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {players
                      .filter((p) => p.team_id === tid)
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() => identify(p.id)}
                          className="flex items-center gap-2 rounded-xl border border-line/60 bg-ink/60 p-2 text-left active:scale-[0.98]"
                        >
                          <Avatar player={p} size={30} />
                          <span className="truncate text-xs font-bold">{p.alias}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={spectate}
              className="mt-4 w-full rounded-xl border border-line py-2.5 text-sm font-semibold text-white/60 active:scale-[0.99]"
            >
              Solo mirar (espectador)
            </button>
          </div>
        )}

        <p className="mt-auto pt-6 text-center text-[10px] text-white/25">Rider Ibérica · Málaga 2026 🐷⛳</p>
      </div>
    </div>
  )
}
