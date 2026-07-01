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
1. ⏳ **Nombres de campeones** (del usuario) → cargar `title` (tabla vacía, 0 filas). 15 huecos históricos = 3 torneos × 5 ed. La slide `PHOTO-2026-07-01-11-53-26.jpg` **solo tiene caras, sin nombres** → no mapeables con fiabilidad (regla "no adivinar"). Plantilla lista para que el usuario dicte alias. Marcador histórico: **Jamones 11 / Salcerdos 4**. Falta también ed. 6 (este año).
2. 📸 **Fotos** de jugadores → recortar de mosaicos rojo/azul en `other/` → Supabase Storage → `player.photo_url`. **Bloque caro en tokens** (procesar imágenes) → sesión dedicada.

**Sorteo:** descartado — los capitanes meten los partidos a mano.

**Deploy:** ✅ HECHO. Ver Sesión 2.

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
