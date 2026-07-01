import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useRider } from './lib/store'
import { useIdentity } from './lib/identity'
import Login from './components/Login'

const NAV = [
  { to: '/', label: 'Inicio', icon: '🏆', end: true },
  { to: '/partidos', label: 'Partidos', icon: '⛳', end: false },
  { to: '/equipos', label: 'Equipos', icon: '🐷', end: false },
  { to: '/sorteo', label: 'Sorteo', icon: '🎲', end: false },
  { to: '/palmares', label: 'Palmarés', icon: '📜', end: false },
]

export default function App() {
  const { edition, error, loading } = useRider()
  const { ready, me, isSpectator, logout } = useIdentity()
  const loc = useLocation()

  if (!loading && !ready) return <Login />

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col">
      {/* Cabecera */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line/60 bg-ink/80 px-4 py-3 backdrop-blur-md">
        <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-gold to-amber-500 text-lg shadow-lg">
          🏌️
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold tracking-tight">RIDER IBÉRICA</div>
          <div className="truncate text-[11px] font-medium text-white/45">
            {edition ? `${edition.number}ª ed. · ${edition.venue}` : 'Málaga 2026'}
          </div>
        </div>
        <button
          onClick={logout}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/60 active:scale-95"
          title="Cambiar de usuario"
        >
          <span className="live-dot size-1.5 rounded-full bg-emerald-400" />
          {me ? me.alias : isSpectator ? 'Espectador' : 'EN VIVO'}
        </button>
      </header>

      {error && (
        <div className="mx-4 mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-300">{error}</div>
      )}

      {/* Contenido */}
      <main key={loc.pathname} className="flex-1 pb-24">
        <Outlet />
      </main>

      {/* Navegación inferior */}
      <nav className="safe-b fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-md items-stretch justify-around border-t border-line/60 bg-ink/90 px-2 pt-1.5 backdrop-blur-md">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-semibold transition ${
                isActive ? 'text-gold' : 'text-white/45'
              }`
            }
          >
            <span className="text-lg leading-none">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
