# Worklog — Rider Ibérica

Log vivo de cambios, errores, decisiones y estado. **Añade entradas (append) al terminar cada bloque.** Formato: fecha + qué se hizo + errores + próximos pasos. Newest arriba.

---

## 📌 Estado actual (mantener al día)

**Hecho:**
- Proyecto Supabase dedicado `RiderIberica` creado + modelo de datos + seed (20 jugadores, 2 equipos, 18 hoyos, 2 jornadas, edición). Tablas de `tournament` y `title` para insignias. `access_code` para login.
- App `app/` (Vite+React+TS+Tailwind v4+framer-motion+Supabase): compila (`npm run build` OK) y corre en dev (LAN).
- Pantallas: Inicio (scoreboard tira y afloja), Partidos, MatchEntry (neto hoyo a hoyo), Equipos, Ficha jugador, Sorteo, Palmarés desglosado.
- Motor match play **neto** con SI real del Parador. Realtime activo.
- **Login/identidad** (código + elegir jugador + canScore). **Insignias de campeón** estilo PGA junto a nombres.

**Pendiente (prioridad):**
1. 📸 **Fotos** de jugadores → recortar de mosaicos en `other/` → Supabase Storage → `player.photo_url`. **Bloque caro en tokens** (procesar imágenes) → sesión dedicada. **Mapeo confirmado por el usuario: mosaico ROJO = Salcerdos 🔴 / mosaico AZUL = Jamones 🔵.** Falta identificar qué archivo de `other/` es cada mosaico y el orden de las caras.
2. 🏆 **Campeones ed. 6 (este año)** de los 3 torneos Pre-Ryder → cuando se jueguen/los pase el usuario, insertar en `title` con `edition_number=6` (aparecen en la sección "Campeones 6ª edición" de Palmarés).

**Creación de partidos:** ✅ HECHO — **panel de capitán/admin** (Sesiones 4-5). Cada capitán mete su lado; **admin (Dani) gestiona ambos equipos**. Partido completo cuando ambos lados tienen alineación. (Sorteo aleatorio con ruleta: descartado.)

**⚠️ Enfoque de producto (aclarado por el usuario, Sesión 5):** la app **NO se usa en vivo** (para el directo usan **Gamebook**). Es un **tablero para antes/después**: cargar alineaciones y resultados, y sobre todo **ver estadísticas, gráficos y resultados**. Priorizar visualización sobre entrada en tiempo real.

**Deploy:** ✅ HECHO (Sesión 2). **Palmarés histórico:** ✅ HECHO (Sesión 3).

---

## 2026-07-01 — Sesión 5 (rol admin + enfoque de producto)

**Hecho:**
- **Rol admin**: migración `player_add_is_admin` (`is_admin boolean default false`). **Dani = admin** (`update ... where alias='Dani'`).
- `types.ts` Player + `is_admin`; `identity.tsx` expone `isAdmin` y `canScore` devuelve true para admin (además de capitán).
- `App.tsx`: tab de gestión visible para capitán **o** admin (admin → etiqueta "Admin" 🛠️).
- `Captain.tsx` refactor: el **admin ve un selector de equipo** y puede montar la alineación de **ambos** equipos; el capitán sigue restringido al suyo. Lógica de guardado igual (por lado, ambos shells).
- Build verde.

**Enfoque de producto aclarado** (ver Estado arriba): app para **antes/después**, no en vivo (usan Gamebook). Foco futuro: **estadísticas, gráficos, resultados**. → Próxima gran línea de trabajo candidata (además de fotos).

---

## 2026-07-01 — Sesión 4 (panel de capitán: crear partidos)

**Contexto:** el usuario preguntó cómo se creaban partidos/resultados hoy. Diagnóstico (agente Explore): meter **resultados** ya funcionaba (`MatchEntry`, `canScore`: jugador→sus partidos, capitán→todos), pero **crear partidos NO existía** (Draw/Matches solo lectura, store solo-lectura). Decidido: construir panel de capitán. Permisos: **cada capitán solo asigna a los suyos**.

**Hecho:**
- Migración `match_unique_session_number`: único `(session_id, number)` en `match` (get-or-create sin duplicados).
- Nueva página `src/pages/Captain.tsx` (ruta `/capitan`, tab de nav 🧢 solo si `is_captain`):
  - Tabs Sábado (scramble 2v2, 5 huecos) / Domingo (singles 1v1, 10 huecos). Nº huecos = `ceil(nJugadoresEquipo/perSide)`.
  - Selects que ofrecen **solo jugadores de mi equipo**, sin repetir (filtra usados). Muestra la alineación **rival en solo lectura** por hueco.
  - Guardar escribe **solo mi lado**: `ensureMatch` (get-or-create) → crea **ambos shells de lado** (a=Salcerdos, b=Jamones; el del rival vacío sin pisar sus jugadores) → `upsert`/update de mi `match_side` (con `playing_handicap` vía `sidePlayingHandicap`) → reemplaza `match_player` de mi lado. Luego `refetch()`.
- **Convención fija de lados**: side `a` = Salcerdos 🔴 / side `b` = Jamones 🔵 (en `Captain.tsx` `SIDE_OF`). Documentado en DATA-MODEL.
- Persistencia directa vía `supabase` en el componente (mismo patrón que `MatchEntry`), store sigue solo-lectura.
- Build verde, lint solo warnings (el `exhaustive-deps` de Captain es intencionado: incluir `matches` pisaría la edición en curso).

**Notas / pendientes de esta feature:**
- **Sin RLS real**: la restricción "capitán solo los suyos" es **client-side** (como todo en la app; no hay Supabase Auth, identidad por localStorage + código). Un usuario técnico podría saltárselo. Aceptable para el grupo de amigos; si se quisiera blindar haría falta Auth + RLS.
- No hay UI para borrar un partido entero ni editar `tee_time` (se pueden meter por MCP si hace falta).

---

## 2026-07-01 — Sesión 3 (deploy ejecutado + palmarés histórico)

**Deploy:** ejecutado vía CLI de Vercel (ver detalle en Sesión 2, actualizada). **LIVE en https://rideriberica.vercel.app**, auto-deploy por git-push probado.

**Palmarés histórico cargado (los 15 títulos ed. 1-5):**
- Usuario dictó los campeones leyendo la slide `PHOTO-2026-07-01-11-53-26.jpg` (solo caras) columna×columna. Parse validado: 3ª ed. entera = Pelayo Narváez (coincide con la cara repetida de la slide) y checksum **Jamones 11 / Salcerdos 4** exacto. Datos completos en `DATA-MODEL.md`.
- **Campeones externos**: 4 campeones (Artaza 🔴, Juan Ortiz 🔴, Diego DLR 🔵, Cubillo 🔵) son jugadores pasados que NO están en el roster de la ed. 6. Como la UI resolvía campeón solo vía `player_id→player`, se añadió soporte:
  - Migración aditiva `title_add_external_champion_fields`: columnas `champion_name` + `team_id` en `title`.
  - `types.ts` Title ampliado; `ui.tsx` nuevo `ExtAvatar` (iniciales + color de equipo); `Palmares.tsx` refactor con tipo `Champ` (player | ext), helper `ChampFace`, tally por equipo contando externos.
  - Fix: `hasCurrent` ahora comprueba `edition_number===current` (antes se activaba con `is_current` y ocultaba mal el aviso "sin campeones de este año").
- **Decisiones del usuario**: insignia junto al nombre = **todos los títulos + número** (ya lo hace `Honors`, no la "vigente"); **vigente = ganadores 5ª ed.** (`is_current=true` en P. Narváez/Edu War/Dani).
- Build verde. Insertados 15 títulos vía `execute_sql` (verificado: 0 huérfanos, 11/4).

**Próximo:** fotos (bloque caro, sesión dedicada); campeones ed. 6 cuando se jueguen.

---

## 2026-07-01 — Sesión 2 (preparar deploy Vercel)

**Contexto:** orden acordado con el usuario → ① deploy → ② sorteo → ③ fotos (bloque caro) → ④ campeones. Proveedor elegido: **Vercel**. Git init: **sí**.

**Hecho:**
- `git init` en la raíz del proyecto (rama `main`) + commit inicial `27f85be` (45 archivos: app + docs). Identidad git local puesta (email del usuario).
- `.gitignore` raíz: excluye `node_modules`, `dist`, `.env`/`.env.*`, y **`other/`** (mosaicos y fotos privadas de los jugadores → no publicar en un repo posiblemente público; las caras acabarán en Supabase Storage).
- `app/vercel.json`: rewrite SPA (`/(.*) → /index.html`) porque usamos `createBrowserRouter` (si no, refrescar en rutas profundas da 404).
- `app/.env.example` con las dos vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`) documentadas. La key es **publishable** (pública por diseño con RLS).
- `npm run build` verde (bundle ~648 kB / 192 kB gzip).

**Deploy COMPLETADO (el CLI de Vercel estaba logueado como `danimr96` → lo hice yo):**
- Usuario creó repo GitHub `Danimr96/RYDERIBERICA` y pusheó. Remoto `origin` configurado.
- Proyecto Vercel `rideriberica` (team `kvothes-projects-8d07c789`, id `prj_mu5w0ToRJMbirWXHHiFAj1LMHcNE`) linkeado desde `app/`, framework Vite autodetectado.
- Env vars `VITE_SUPABASE_URL` + `VITE_SUPABASE_KEY` cargadas en **Production**.
- **URL pública LIVE: https://rideriberica.vercel.app** (HTTP 200, título y bundle OK).
- `vercel git connect` al repo GitHub + **`rootDirectory=app`** fijado vía API (v9 projects PATCH) → los builds por git-push funcionan. Cada `git push` a `main` = redeploy automático.
- Token CLI en `~/Library/Application Support/com.vercel.cli/auth.json` (por si hay que reusar la API).

**Próximo (mi lado):** palmarés (esperando 15 alias del usuario); fotos como sesión dedicada.

---

## 2026-07-01 — Sesión 1 (arranque)

**Contexto:** el usuario quiere un dashboard tipo Ryder Cup para la Rider Ibérica (Málaga 2026, 6ª ed.), muy visual. Evento: viernes llegada + sorteo, sábado dobles scramble, domingo individual.

**Decisiones cerradas** (ver DECISIONS.md): 10v10; 5+10=15 pts; match play **neto** (hcp cap 22); Jamones **+1,5** de ventaja; empate → retiene **Jamones**; neto con SI real del Parador; login por jugador; cada pareja mete su partido.

**Hecho:**
- Roster de los 20 extraído de las fichas de `other/`; recorrido del Parador (par+SI) vía WebSearch/WebFetch (thesocialgolfer). → todo en DATA-MODEL.md.
- Supabase: creado proyecto `RiderIberica` (0 €, free tier), schema + RLS pública + realtime + seed.
- App completa base + login + insignias + palmarés desglosado. Build verde. Dev server en background (`npm run dev -- --host`, `http://192.168.1.133:5173`).
- Docs creadas: CLAUDE.md + docs/ (DECISIONS, DATA-MODEL, ARCHITECTURE, RUNBOOK, WORKLOG). Memorias: `rider-iberica`, `no-tocar-porra26`.

**Errores/resueltos:**
- `tsc` narrowing de `edition` dentro de `setGross` (MatchEntry) → añadida guarda `!edition`. OK.
- Fotos movidas por el usuario de la raíz a `other/` a mitad de sesión → rutas actualizadas.

**Regla crítica reafirmada:** NO tocar el proyecto `Porra26` (producción). La Rider vive en proyecto aparte.

**Próximo:** cargar campeones (esperando nombres), fotos, deploy.
