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
1. ⏳ **Nombres de campeones** (del usuario) → cargar `title` → encender insignias/palmarés (incl. este año, ed. 6).
2. 📸 **Fotos** de jugadores → recortar de mosaicos rojo/azul en `other/` → Supabase Storage → `player.photo_url`.
3. 🚀 **Deploy** a URL pública (Vercel/Cloudflare) — decidir proveedor (acción hacia fuera → confirmar).
4. 🎲 **Herramienta de sorteo** / creación de partidos (`match`, `match_side`, `match_player`).

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
