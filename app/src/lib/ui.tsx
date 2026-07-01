import type { Player, TeamId } from './types'

export const TEAM_COLORS: Record<TeamId, { main: string; dark: string; grad: string; text: string }> = {
  salcerdos: { main: '#d21f2b', dark: '#7a0f16', grad: 'linear-gradient(135deg,#e11d2b,#7a0f16)', text: '#fff' },
  jamones: { main: '#1e4fd6', dark: '#0b2a6b', grad: 'linear-gradient(135deg,#2a5fe6,#0b2a6b)', text: '#fff' },
}

export const TEAM_LABEL: Record<TeamId, string> = { salcerdos: 'Salcerdos', jamones: 'Jamones' }

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const a = parts[0]?.[0] ?? ''
  const b = parts[1]?.[0] ?? ''
  return (a + b).toUpperCase()
}

export function Avatar({
  player,
  size = 44,
  ring = true,
}: {
  player: Player
  size?: number
  ring?: boolean
}) {
  const c = TEAM_COLORS[player.team_id]
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '9999px',
    boxShadow: ring ? `0 0 0 2px ${c.main}` : undefined,
  }
  if (player.photo_url) {
    return (
      <img
        src={player.photo_url}
        alt={player.alias}
        style={style}
        className="object-cover shrink-0 bg-card"
        loading="lazy"
      />
    )
  }
  return (
    <div
      style={{ ...style, background: c.grad, fontSize: size * 0.34 }}
      className="grid place-items-center font-extrabold text-white shrink-0 tnum"
    >
      {initials(player.full_name)}
    </div>
  )
}

/** Avatar para campeones históricos sin ficha de jugador (iniciales + color de equipo). */
export function ExtAvatar({
  name,
  teamId,
  size = 44,
  ring = true,
}: {
  name: string
  teamId: TeamId
  size?: number
  ring?: boolean
}) {
  const c = TEAM_COLORS[teamId]
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '9999px',
        boxShadow: ring ? `0 0 0 2px ${c.main}` : undefined,
        background: c.grad,
        fontSize: size * 0.34,
      }}
      className="grid place-items-center font-extrabold text-white shrink-0 tnum"
    >
      {initials(name)}
    </div>
  )
}

export function TeamPill({ team, className = '' }: { team: TeamId; className?: string }) {
  const c = TEAM_COLORS[team]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${className}`}
      style={{ background: `${c.main}22`, color: c.main }}
    >
      {TEAM_LABEL[team]}
    </span>
  )
}

export function fmtPts(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',')
}
