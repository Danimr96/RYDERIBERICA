import { useRider } from '../lib/store'

/**
 * Insignias de campeón junto al nombre, estilo PGA / DP World Tour.
 * - compact: emoji + nº pequeñito (para tarjetas y listados)
 * - full: chips con etiqueta corta + nº (para la ficha)
 */
export default function Honors({
  playerId,
  compact = true,
  className = '',
}: {
  playerId: string
  compact?: boolean
  className?: string
}) {
  const { honorsByPlayer } = useRider()
  const honors = honorsByPlayer.get(playerId)
  if (!honors || honors.length === 0) return null

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-0.5 align-middle ${className}`}>
        {honors.map((h) => (
          <span
            key={h.tournament.id}
            title={`${h.tournament.name} ×${h.count} (ed. ${h.editions.join(', ')})`}
            className="inline-flex items-center rounded-full px-1 text-[9px] font-black leading-none tnum"
            style={{ background: `${h.tournament.color}26`, color: h.tournament.color }}
          >
            <span className="text-[10px]">{h.tournament.emoji}</span>
            {h.count > 1 && <span className="ml-px">{h.count}</span>}
          </span>
        ))}
      </span>
    )
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {honors.map((h) => (
        <span
          key={h.tournament.id}
          title={`Ediciones ${h.editions.join(', ')}`}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={{ background: `${h.tournament.color}22`, color: h.tournament.color }}
        >
          <span>{h.tournament.emoji}</span>
          {h.tournament.short}
          <span className="rounded-full bg-black/30 px-1 text-[10px] font-black tnum text-white">
            ×{h.count}
          </span>
        </span>
      ))}
    </div>
  )
}
