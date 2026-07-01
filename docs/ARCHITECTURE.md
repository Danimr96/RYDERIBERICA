# Arquitectura — Rider Ibérica

## Estructura (`app/src`)
```
lib/
  supabase.ts    Cliente Supabase (env VITE_SUPABASE_URL / VITE_SUPABASE_KEY)
  types.ts       Tipos del dominio (Edition, Team, Player, Match, Title…)
  scoring.ts     Motor de puntuación match play NETO (puro)
  store.tsx      RiderProvider + useRider(): carga TODO + realtime + marcadores + honorsByPlayer
  identity.tsx   IdentityProvider + useIdentity(): login/identidad + canScore()
  ui.tsx         TEAM_COLORS, Avatar, TeamPill, helpers de formato
components/
  Scoreboard.tsx Marcador "tira y afloja" (framer-motion)
  MatchCard.tsx  Tarjeta de partido (con insignias)
  Honors.tsx     Insignias de campeón (compact / full)
  Login.tsx      Pantalla de acceso (código + elegir jugador)
pages/
  Home · Matches · MatchEntry · Teams · PlayerPage · Draw · Palmares
main.tsx  Router + RiderProvider > IdentityProvider
App.tsx   Layout (header + bottom nav) + gate de Login
```

## Flujo de datos
- `RiderProvider` hace **una** carga (Promise.all de todas las tablas), ensambla `MatchFull` (match + sides + players + scores) y se suscribe a **realtime** (`postgres_changes`, `*`) con **debounce 250ms** → refetch. Simple y robusto para ~15 partidos.
- Los **estados de partido** se computan en cliente (`computeMatch`) desde `hole_score`. Los marcadores de equipo (`score` asegurado / `live` proyección) se derivan de esos estados + bonus.
- `IdentityProvider` (encima del router) gestiona código de acceso + jugador actual (localStorage) y expone `canScore(playerIds)`.

## Motor de puntuación (`scoring.ts`)
- `courseHandicap(hi, edition)` → `round(hi·slope/113 + (CR−par))`, cap a `handicap_cap`.
- `sidePlayingHandicap(players, session, edition)` → individual 100%; scramble `0.35·bajo + 0.15·alto`.
- `strokesOnHole(total, SI)` → reparto por stroke index (soporta >18).
- `computeMatch(...)` → outcomes por hoyo (neto), `upA`, `thru`, `closed/finished`, `label`, `points` (asegurados) y `projected` (en vivo).
- Prioridad: si `hole_score.winner` está seteado (override manual) se respeta; si no, se calcula del bruto + golpes.

## Escritura (MatchEntry)
- Entrada **hoyo a hoyo** con steppers de golpe bruto por lado. `upsert` en `hole_score` (onConflict `match_id,hole_number`) + `update` de la fila `match` (status/winner/points/thru/label) para consistencia de lectores externos.
- Gated por `canScore` (jugadores del partido o capitán); resto en modo lectura.

## Convenciones UI
- Mobile-first, `max-w-md`, bottom nav, tema oscuro broadcast, `tnum` para cifras. Colores en `TEAM_COLORS`.
- Realtime → todas las pantallas reflejan cambios sin recargar.
