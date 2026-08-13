/**
 * Operaciones para escribir escenarios.
 *
 * Todas trabajan por REGIÓN, no por coincidencia exacta de coordenadas: un muro
 * se quita nombrando el pedazo de planta donde está, no repitiendo sus cuatro
 * números. Así un escenario sobrevive a que el levantamiento base se corrija
 * unos centímetros, que es exactamente lo que ha estado pasando.
 */

import type { Furniture, Rect, Room } from "./types";

/** ¿El rectángulo `r` cae dentro de `region`, con una holgura? */
export const inside = (r: Rect, region: Rect, slack = 0.02) =>
  r[0] >= region[0] - slack &&
  r[1] >= region[1] - slack &&
  r[2] <= region[2] + slack &&
  r[3] <= region[3] + slack;

export const withoutIn = (rects: Rect[], ...regions: Rect[]) =>
  rects.filter((r) => !regions.some((region) => inside(r, region)));

/** Sustituye campos de un cuarto sin tocar los demás. */
export const patchRoom = (rooms: Room[], id: string, patch: Partial<Room>) =>
  rooms.map((room) => (room.id === id ? { ...room, ...patch } : room));

/** Saca todo el mobiliario de esos cuartos. Útil antes de reamueblar. */
export const clearRooms = (items: Furniture[], ...roomIds: string[]) =>
  items.filter((piece) => !piece.room || !roomIds.includes(piece.room));

/** Saca piezas concretas de un cuarto, por tipo. */
export const clearTypes = (items: Furniture[], roomId: string, ...types: string[]) =>
  items.filter((piece) => piece.room !== roomId || !types.includes(piece.type));
