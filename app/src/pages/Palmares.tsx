import { Link } from 'react-router-dom'
import { useRider } from '../lib/store'
import { Avatar, ExtAvatar, TEAM_COLORS } from '../lib/ui'
import type { Player, Tournament, TeamId } from '../lib/types'

/** Campeón resuelto: jugador del roster o campeón histórico externo (jugador pasado). */
type Champ =
  | { kind: 'player'; player: Player }
  | { kind: 'ext'; name: string; team_id: TeamId }

export default function Palmares() {
  const { edition, tournaments, titles, playersById, players, loading } = useRider()
  if (loading || !edition) return <div className="p-4 text-sm text-white/40">Cargando…</div>

  const champ = (tournamentId: string, ed: number): Champ | null => {
    const t = titles.find((x) => x.tournament_id === tournamentId && x.edition_number === ed)
    if (!t) return null
    if (t.player_id) {
      const p = playersById.get(t.player_id)
      return p ? { kind: 'player', player: p } : null
    }
    if (t.champion_name && t.team_id) return { kind: 'ext', name: t.champion_name, team_id: t.team_id }
    return null
  }

  const editions = Array.from({ length: edition.number }, (_, i) => i + 1) // 1..6
  const current = edition.number
  const hasCurrent = titles.some((t) => t.edition_number === current)

  // recuento por equipo (de todos los títulos cargados, incl. campeones externos)
  const tally = { salcerdos: 0, jamones: 0 }
  for (const t of titles) {
    const team: TeamId | null = t.player_id ? playersById.get(t.player_id)?.team_id ?? null : t.team_id
    if (team) tally[team]++
  }
  const anyTitles = titles.length > 0

  return (
    <div className="p-4 pb-8">
      <h1 className="text-lg font-black">Palmarés</h1>
      <p className="mt-1 text-xs text-white/45">Torneos clasificatorios de la Rider Ibérica.</p>

      {/* Marcador histórico por equipos */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-line/70 bg-card/70">
        <div className="px-4 pt-4 text-center text-[11px] font-bold uppercase tracking-widest text-white/40">
          Campeones históricos · Torneos Pre-Ryder
        </div>
        <div className="grid grid-cols-2 items-center gap-2 px-6 py-4">
          <div className="text-center">
            <div className="text-4xl font-black" style={{ color: TEAM_COLORS.jamones.main }}>
              {anyTitles ? tally.jamones : 11}
            </div>
            <div className="text-xs font-bold text-white/60">Jamones 🔵</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black" style={{ color: TEAM_COLORS.salcerdos.main }}>
              {anyTitles ? tally.salcerdos : 4}
            </div>
            <div className="text-xs font-bold text-white/60">Salcerdos 🔴</div>
          </div>
        </div>
      </div>

      {/* Campeones de este año */}
      <h2 className="mt-6 mb-2 text-sm font-extrabold uppercase tracking-wide text-gold">
        🏆 Campeones {current}ª edición
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {tournaments.map((t) => {
          const c = champ(t.id, current)
          return (
            <div key={t.id} className="rounded-2xl border border-line/60 bg-card/70 p-3 text-center">
              <div className="text-xl">{t.emoji}</div>
              <div className="text-[10px] font-bold text-white/55">{t.name}</div>
              {c ? (
                <div className="mt-2 flex flex-col items-center gap-1">
                  <ChampFace c={c} size={40} />
                  <span className="text-xs font-bold">
                    {c.kind === 'player' ? c.player.alias : c.name}
                  </span>
                </div>
              ) : (
                <div className="mt-2 grid h-[62px] place-items-center text-[10px] text-white/30">
                  por cargar
                </div>
              )}
            </div>
          )
        })}
      </div>
      {!hasCurrent && (
        <p className="mt-2 text-center text-[10px] text-white/30">
          Aún sin campeones de este año — pásame los nombres y los cargo.
        </p>
      )}

      {/* Parrilla completa por edición */}
      <h2 className="mt-6 mb-2 text-sm font-extrabold uppercase tracking-wide">Por edición</h2>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-separate border-spacing-1 text-center">
          <thead>
            <tr className="text-[10px] text-white/40">
              <th className="text-left"></th>
              {editions.map((e) => (
                <th key={e} className="font-bold">{e}ª</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tournaments.map((t) => (
              <TournamentRow key={t.id} t={t} editions={editions} champ={champ} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-[11px] text-white/30">
        {players.length} jugadores · {edition.venue}
      </p>
    </div>
  )
}

/** Cara del campeón: enlace a su ficha si es del roster; iniciales si es externo. */
function ChampFace({ c, size, ring = true }: { c: Champ; size: number; ring?: boolean }) {
  if (c.kind === 'player') {
    return (
      <Link to={`/jugador/${c.player.id}`} title={c.player.full_name}>
        <Avatar player={c.player} size={size} ring={ring} />
      </Link>
    )
  }
  return (
    <span title={c.name}>
      <ExtAvatar name={c.name} teamId={c.team_id} size={size} ring={ring} />
    </span>
  )
}

function TournamentRow({
  t,
  editions,
  champ,
}: {
  t: Tournament
  editions: number[]
  champ: (tid: string, ed: number) => Champ | null
}) {
  return (
    <tr>
      <td className="whitespace-nowrap pr-2 text-left align-middle">
        <span className="text-sm">{t.emoji}</span>{' '}
        <span className="text-[10px] font-bold text-white/60">{t.short}</span>
      </td>
      {editions.map((e) => {
        const c = champ(t.id, e)
        return (
          <td key={e} className="align-middle">
            {c ? (
              <ChampFace c={c} size={30} ring={false} />
            ) : (
              <div className="mx-auto size-[30px] rounded-full border border-dashed border-line/60" />
            )}
          </td>
        )
      })}
    </tr>
  )
}
