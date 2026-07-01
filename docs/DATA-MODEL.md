# Modelo de datos — Rider Ibérica

Proyecto Supabase **`RiderIberica`** (id `qflxrwpzjrrfhqmzcler`). Schema `public`. RLS pública (policies `public_read_*` / `public_write_*`). Realtime en `match`, `match_side`, `match_player`, `hole_score`, `session`, `title`.

> Esta transcripción evita reabrir las imágenes de `other/`. Si necesitas los datos, léelos AQUÍ.

## Tablas

- **edition** (fila única id=1): `number=6`, `venue`, `course_*` (par 72, slope 130, rating 72.9), `handicap_cap=22`, `defending_team='jamones'`, `jamones_bonus=1.5`, `salcerdos_bonus=0`, `total_match_points=15`, `points_to_win=8.25`, `start_date=2026-07-04`, `access_code='RIDER26'`.
- **team** (`salcerdos`/`jamones`): name, captain, color, accent, emoji.
- **player**: team_id, full_name, alias, handicap_index, record_w/l/h, is_rookie, is_captain, photo_url, sort_order.
- **hole** (1..18): par, stroke_index.
- **session** (`saturday`/`sunday`): name, day, format (`scramble_doubles`/`singles`), handicap_allowance, sort_order, status.
- **match**: session_id, number, status (`scheduled`/`live`/`finished`), winner, points_a/b, thru, state_label, tee_time, updated_at.
- **match_side**: match_id, side (`a`/`b`), team_id, playing_handicap. (único por match+side)
- **match_player**: match_side_id, player_id. (1 individual / 2 scramble)
- **hole_score**: match_id, hole_number, gross_a, gross_b, winner, updated_at. (único por match+hole)
- **tournament** (`5js`/`espetec`/`masterpig`): name, short (5J/ESP/MP), emoji, color, sort_order.
- **title**: player_id, tournament_id, edition_number (1..6), is_current, note. → insignias/palmarés.

## Roster (20 jugadores) — alias · V-D-E · hcp

**🔴 Salcerdos** (cap. Luis Salcedo)
| Nombre | Alias | V-D-E | Hcp |
|---|---|---|---|
| Luis Salcedo (C) | Salcedo | 9-1-0 | 3,1 |
| Edu War | Edu War | 1-2-1 | 7,0 |
| Jorge Lacasa | House | 0-2-0 | 21,3 |
| Javier Paul | Paul | 2-6-0 | 20,3 |
| Álvaro Gollury | Gollury | 0-2-0 | 27,5 |
| Pepe Méndez | Pepe | 2-4-2 | 15,7 |
| Xuso López | Xuso | rookie | 15,6 |
| Álvaro Suárez | Novales | 0-1-1 | 19,1 |
| Diego Losada | Diego | rookie | 20,5 |
| Daniel Martínez | Dani | 3-1-0 | 7,2 |

**🔵 Jamones** (cap. Gonzalo Serrano)
| Nombre | Alias | V-D-E | Hcp |
|---|---|---|---|
| Gonzalo Serrano (C) | Serrano | 4-6-0 | 16,6 |
| Pelayo Lasso | Pelayo L. | 3-4-1 | 4,0 |
| Pelayo Narváez | Pelayo N. | 4-4-2 | 9,3 |
| Jaime Sabau | Sabau | 5-1-0 | 19,6 |
| Peju Serra | Peju | 4-3-3 | 16,7 |
| Gonzalo Aser | Aser | 2-4-0 | 19,6 |
| Álvaro de la Peña | Alvaropa | 2-1-1 | 14,1 |
| Jaime Monsalve | Monsal | rookie | 13,9 |
| Estanis Queipo | Estanis | 3-7-0 | 20,9 |
| Miguel Megias | Megias | 2-2-0 | 27,2 |

## Recorrido — Parador de Málaga Golf (tees amarillas, par 72)
| Hoyo | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Par | 5 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 4 | 3 | 5 | 3 | 5 | 4 | 5 | 4 | 4 |
| SI | 18 | 13 | 15 | 2 | 5 | 9 | 1 | 14 | 8 | 11 | 6 | 7 | 12 | 10 | 4 | 17 | 16 | 3 |

Fuente SI: thesocialgolfer.com (yellow tees). Slope 130 / CR 72.9.

## Assets originales (`other/`)
- Fichas individuales (fondo sepia/azul, foto circular, alias, V-D-E, hcp): PHOTO-2026-06-29-* (Salcerdos) y UUID `.JPG` (Jamones).
- Mosaicos de equipo: rojo (Salcerdos) y azul (Jamones) — headshots circulares limpios (útiles para recortar avatares).
- Slide palmarés: `PHOTO-2026-07-01-11-53-26.jpg` (campeones históricos, caras pequeñas).
- Pendiente: recortar headshots → subir a Storage → `player.photo_url`.
