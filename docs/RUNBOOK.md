# Runbook — Rider Ibérica

## Entorno
- Node 22 / npm 11. Código en `app/`. Assets en `other/`.
- `app/.env`:
  ```
  VITE_SUPABASE_URL=https://qflxrwpzjrrfhqmzcler.supabase.co
  VITE_SUPABASE_KEY=sb_publishable_qur6-D_oLt6kfpqtbp4yZA_iJ-yRedb   # key pública (publishable)
  ```

## Desarrollo
```bash
cd app
npm install                # primera vez
npm run dev -- --host      # arrancar en LAN (correr en background)
# Local:   http://localhost:5173
# Network: http://<IP-LAN>:5173   (para el móvil en la misma wifi)
npm run build              # tsc -b + vite build  ← verificación antes de "done"
npm run lint
```
- Dev server: mantener **uno** en background. Vite tiene HMR; no relanzar por cada cambio.

## Base de datos (MCP Supabase — SOLO proyecto Rider `qflxrwpzjrrfhqmzcler`)
- DDL / cambios de esquema → `apply_migration` (nombre snake_case).
- Datos / seed / consultas → `execute_sql`.
- Otros: `get_project_url`, `get_publishable_keys`, `get_logs`, `get_advisors`, `list_tables`.
- ⚠️ Jamás ejecutar sobre `Porra26` (`ngnzrfvzchglsdqywlxx`).

### Test rápido de lectura pública (REST)
```bash
KEY="sb_publishable_qur6-D_oLt6kfpqtbp4yZA_iJ-yRedb"
curl -s "https://qflxrwpzjrrfhqmzcler.supabase.co/rest/v1/player?select=alias&limit=3" -H "apikey: $KEY"
```

## Deploy (pendiente de decidir Vercel vs Cloudflare Pages)
- Build estático (`app/dist`). Configurar las mismas env vars `VITE_SUPABASE_*` en el proveedor.
- SPA con react-router → activar fallback a `index.html` (rewrites) para rutas.
- Requerirá login del usuario en el CLI del proveedor (acción hacia fuera → confirmar).

## Tareas pendientes operativas
- Subir fotos jugadores a Supabase Storage y setear `player.photo_url`.
- Cargar `title` con campeones (esperando nombres del usuario).
- Herramienta/seed de sorteo para crear `match` + `match_side` + `match_player`.
