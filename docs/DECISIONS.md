# Decisiones — Rider Ibérica

Reglas del torneo y decisiones de producto/técnicas. **Fuente de verdad** para el motor y la UI. Si algo cambia, actualiza aquí + `edition` en Supabase.

## Formato del torneo
- **2 equipos de 10**: Salcerdos 🔴 (cap. Luis Salcedo) vs Jamones 🔵 (cap. Gonzalo Serrano).
- **Sábado**: 5 partidos **dobles scramble** (parejas 2v2). → 5 puntos.
- **Domingo**: 10 partidos **individuales**. → 10 puntos.
- **15 puntos** en juego en total.
- Sede: **Parador de Málaga Golf** (par 72, slope 130, CR 72.9, tees amarillas). Rider **6ª edición**, sábado 4 jul 2026 (llegada viernes 3, sorteo en la cena).

## Puntuación (match play NETO)
- Cada partido vale **1 punto** (**0,5** si empate/AS).
- **Neto** con hándicap. Hándicap de juego = `round(HI × Slope/113 + (CR − Par))`, **topado a 22**.
- **Individual**: allowance 100% del jugador.
- **Dobles scramble**: hándicap del lado = `35% del más bajo + 15% del más alto` (estándar 2 jugadores).
- En cada partido, el lado de menor hándicap juega a 0 y el rival recibe la **diferencia**, repartida por los hoyos de **menor stroke index** (usa el SI real del Parador, ver DATA-MODEL).
- Estado en vivo y cierre automático: `3&2`, `2 UP`, `AS`, `DORMIE`, `EMPATE`.

## Ventaja y desempate
- **Jamones parten con +1,5** (por los torneos clasificatorios). Salcerdos +0.
- Pool total = 15 + 1,5 = **16,5**. Mayoría = **8,25 para ganar**.
- **Empate a 8,25 → retiene el título el equipo Jamones** (defensor vigente).

## Torneos clasificatorios (para insignias / palmarés)
- Tres torneos "Pre-Ryder": **5Js CUP** 🖐️, **Espetec Open** 🌭, **Master Pig** 🐷. Se juegan por edición (1..N).
- Agregado histórico declarado: **Jamones 11 – Salcerdos 4** (torneos ed. 1-5).
- Los **campeones por torneo/edición** los aporta el usuario (las fotos de la slide son demasiado pequeñas para mapear caras con fiabilidad → NO adivinar). Se cargan en la tabla `title`. Insignias estilo PGA junto al nombre.
- ⏳ PENDIENTE: recibir los nombres (alias) de cada casilla, incl. **campeones de este año (ed. 6)**.

## Login / identidad
- App de amigos **sin auth pesada**. Gate por **código de acceso** del evento (`edition.access_code`, por defecto `RIDER26`) + **elegir tu jugador** ("¿quién eres?"). Persistido en `localStorage`.
- **Puntuar un partido**: solo los jugadores de ese partido o un **capitán** (`player.is_captain`). Resto: modo lectura. Opción **espectador**.
- (Futuro posible: PIN por jugador o Supabase Auth si se quiere más seguridad.)

## Técnicas
- Stack: React + Vite + TS + Tailwind v4 + framer-motion + Supabase (Realtime). Deploy previsto: Vercel/Cloudflare Pages (pendiente decidir).
- **RLS pública** (lectura y escritura anónimas) por ser evento privado entre amigos sin datos sensibles, en proyecto aislado.
- Realtime: la app recomputa el marcador en cliente desde `hole_score` (no depende de campos denormalizados).
