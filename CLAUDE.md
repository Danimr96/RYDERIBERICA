# CLAUDE.md — Rider Ibérica · Málaga 2026

App-dashboard tipo **Ryder Cup** para el torneo de golf de un grupo de ~20 amigos (2 equipos de 10). Marcador en vivo, match play neto, insignias de campeón, login por jugador. Objetivo: **muy visual, "efecto pago", sin fricción**.

> Este archivo es el **punto de entrada** de cada sesión. Léelo entero + las últimas entradas de `docs/WORKLOG.md`. **No hace falta releer nada más** (ni las fotos, ni todo el código) salvo que la tarea lo pida.

---

## 🚨 Reglas de oro (leer siempre)

1. **NUNCA tocar el proyecto Supabase `Porra26`** (id `ngnzrfvzchglsdqywlxx`). Es otra app en producción del usuario. Cero migraciones, cero escrituras, cero lecturas de escritura. La Rider vive en un proyecto **aparte**.
2. Proyecto Supabase de la Rider: **`RiderIberica`** · id **`qflxrwpzjrrfhqmzcler`** · org `uermsvvvvgpuduaodkjc` · región `eu-west-1`.
3. Todo el código de la app está en **`app/`** (Vite + React + TS). Los assets originales (fichas maquetadas, mosaicos) están en **`other/`**.
4. **Idioma de la UI: español.** Textos, labels y comentarios de dominio en español.
5. Confirmar con el usuario antes de acciones **irreversibles o hacia fuera** (crear proyectos cloud, borrar datos, deploy público, enviar cosas). Migraciones aditivas al proyecto Rider: OK sin preguntar.

---

## 🧭 Arranque rápido de sesión (checklist)

1. Lee `CLAUDE.md` (este archivo) + las **2-3 últimas entradas** de `docs/WORKLOG.md`.
2. Mira el estado en `docs/WORKLOG.md` → sección "Estado actual / Pendiente".
3. Si vas a tocar datos/reglas → `docs/DECISIONS.md` y `docs/DATA-MODEL.md`.
4. Trabaja. Al terminar el bloque, **añade una entrada a `docs/WORKLOG.md`** (append, no reescribir).

---

## 🛠️ Comandos (ver `docs/RUNBOOK.md` para detalle)

```bash
# desde app/
npm run dev -- --host      # dev server (LAN), correr en background
npm run build              # tsc -b + vite build (verificación de tipos + bundle)
npm run lint               # eslint
```
- Base de datos: **solo vía MCP Supabase** (`apply_migration` para DDL, `execute_sql` para datos). Nunca psql/CLI a mano.
- Node 22 / npm 11. Tailwind **v4** (plugin `@tailwindcss/vite`, config en `src/index.css` con `@theme`, sin `tailwind.config`).

---

## 📐 Convenciones de código

- **TS estricto** + `verbatimModuleSyntax` → usa `import type { … }` para tipos. `noUnusedLocals/Parameters` activos: nada sin usar.
- Componentes en `src/components`, páginas en `src/pages`, lógica en `src/lib`.
- **Motor de puntuación** en `src/lib/scoring.ts` (puro, testeable). No meter reglas de negocio en componentes.
- **Datos + realtime** centralizados en `src/lib/store.tsx` (`useRider()`); identidad en `src/lib/identity.tsx` (`useIdentity()`).
- Estética broadcast oscura; colores de equipo en `src/lib/ui.tsx` (`TEAM_COLORS`). Salcerdos 🔴 `#d21f2b`, Jamones 🔵 `#1e4fd6`, dorado `#ffd21f`.
- Sin librerías nuevas salvo necesidad real. Ya usamos: `@supabase/supabase-js`, `react-router-dom`, `framer-motion`, Tailwind v4.
- Verifica con `npm run build` antes de dar algo por terminado (typecheck real).

---

## 🤖 Herramientas, skills y MCPs

- **MCP Supabase** → toda la BD del proyecto Rider (migraciones, seed, keys, logs, advisors). Recuerda regla de oro nº1.
- **WebSearch/WebFetch** → datos externos (p.ej. stroke index del campo). Cachear el resultado en `docs/DATA-MODEL.md` para no repetir.
- **Agent `Explore`** → búsquedas amplias en el código sin gastar contexto del hilo principal (devuelve conclusiones, no volcados).
- **Skills útiles**: `/code-review` (revisar diff antes de dar por bueno), `/simplify` (limpieza), `deep-research` (investigación). Invocar solo cuando aporte.
- **No** usar Workflow / multi-agente salvo que el usuario lo pida explícitamente.

---

## 🪙 Optimización de tokens / contexto / sesiones

El usuario quiere **eficiencia y que le avise**. Reglas:

- **No releer las 20 fichas** de `other/`: sus datos ya están transcritos en `docs/DATA-MODEL.md`. Abrir imágenes solo si la tarea es sobre una imagen concreta.
- **Lecturas quirúrgicas**: lee solo el trozo de archivo que necesitas; no vuelques archivos enteros por costumbre.
- **No re-verificar** con re-lecturas lo que un Edit/Write ya confirmó.
- Delega búsquedas multi-archivo en el agente **Explore** (conclusión, no dumps).
- Mantén **un solo** dev server en background; no relances builds innecesarios.
- **Handoff entre sesiones vía `docs/WORKLOG.md`**: si el contexto se llena, una sesión nueva debe poder continuar leyendo solo `CLAUDE.md` + WORKLOG. Mantenlo al día.
- **Avisos proactivos al usuario** (esto lo pidió): avisar cuando
  - el contexto de la sesión esté cargándose mucho → sugerir `/compact` o abrir sesión nueva (el estado queda en WORKLOG),
  - una tarea vaya a consumir muchos tokens (p.ej. procesar muchas imágenes) → proponerlo antes,
  - convenga cerrar el bloque y registrar en WORKLOG.

---

## 📚 Documentación del proyecto (`docs/`)

| Archivo | Qué contiene |
|---|---|
| `docs/WORKLOG.md` | **Log vivo**: cambios, errores, decisiones, estado y pendientes por sesión. Empieza por aquí. |
| `docs/DECISIONS.md` | Reglas del torneo y decisiones de producto/técnicas (formato, puntuación neta, hcp, login…). |
| `docs/DATA-MODEL.md` | Esquema Supabase, roster completo de los 20, recorrido del Parador (par + SI). |
| `docs/ARCHITECTURE.md` | Estructura de la app, flujo de datos/realtime, motor de puntuación, pantallas. |
| `docs/RUNBOOK.md` | Comandos, entorno, deploy, tareas Supabase, cómo arrancar/parar el server. |

## ✅ Definition of done

Un cambio está "hecho" cuando: compila (`npm run build`), respeta convenciones, la UI está en español, **no toca Porra26**, y queda **registrado en `docs/WORKLOG.md`**.
