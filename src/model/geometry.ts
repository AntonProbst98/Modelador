/**
 * Cálculos sobre la data: áreas, medidas y encuadre.
 *
 * Todo lo que la UI muestra como número sale de aquí, no de constantes
 * escritas a mano — así la leyenda nunca puede contradecir al modelo.
 */

import { LEVEL_DEFAULTS, type Level, type Property, type Rect, type Room } from "./types";

export interface BBox {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
}

export const rectArea = ([x1, z1, x2, z2]: Rect) => Math.abs(x2 - x1) * Math.abs(z2 - z1);

/** Asume rectángulos que no se traslapan (es como se autoran los cuartos). */
export const rectsArea = (rects: Rect[]) => rects.reduce((s, r) => s + rectArea(r), 0);

export function rectsBBox(rects: Rect[]): BBox {
  const box: BBox = { x1: Infinity, z1: Infinity, x2: -Infinity, z2: -Infinity };
  for (const [x1, z1, x2, z2] of rects) {
    box.x1 = Math.min(box.x1, x1, x2);
    box.z1 = Math.min(box.z1, z1, z2);
    box.x2 = Math.max(box.x2, x1, x2);
    box.z2 = Math.max(box.z2, z1, z2);
  }
  return box;
}

export function largestRect(rects: Rect[]): Rect | null {
  let best: Rect | null = null;
  let bestArea = -1;
  for (const r of rects) {
    const a = rectArea(r);
    if (a > bestArea) {
      bestArea = a;
      best = r;
    }
  }
  return best;
}

export const roomArea = (room: Room) => rectsArea(room.rects);

export const isInterior = (room: Room) => room.interior ?? room.kind !== "outdoor";

/** Centro del rectángulo más grande: dónde cae bien la etiqueta. */
export function roomAnchor(room: Room): [number, number] {
  if (room.labelAt) return room.labelAt;
  const r = largestRect(room.rects);
  if (!r) return [0, 0];
  return [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
}

/**
 * Medidas del tramo dominante, p.ej. "3.6 × 3.75". En cuartos irregulares es el
 * tramo mayor; la ficha lo aclara con el conteo de tramos, así que no hace falta
 * degradar el dato a un área que ya se muestra aparte.
 */
export function roomNote(room: Room): string {
  if (room.note) return room.note;
  const r = largestRect(room.rects);
  if (!r) return "—";
  return `${fmt(r[2] - r[0])} × ${fmt(r[3] - r[1])} m`;
}

/** Máximo dos decimales, sin ceros de relleno. */
export const fmt = (n: number) => String(Math.round(n * 100) / 100);

export const fmtArea = (n: number) => `${Math.round(n * 10) / 10} m²`;

export function levelBBox(level: Level): BBox {
  const rects = [...level.extWalls, ...level.rooms.flatMap((r) => r.rects)];
  return rects.length ? rectsBBox(rects) : { x1: 0, z1: 0, x2: 10, z2: 10 };
}

export interface LevelMetrics {
  interior: number;
  exterior: number;
  total: number;
  width: number;
  depth: number;
}

export function levelMetrics(level: Level): LevelMetrics {
  let interior = 0;
  let exterior = 0;
  for (const room of level.rooms) {
    if (isInterior(room)) interior += roomArea(room);
    else exterior += roomArea(room);
  }
  const box = levelBBox(level);
  return {
    interior,
    exterior,
    total: interior + exterior,
    width: box.x2 - box.x1,
    depth: box.z2 - box.z1,
  };
}

export function propertyMetrics(property: Property): LevelMetrics {
  const levels = property.levels.map(levelMetrics);
  return {
    interior: levels.reduce((s, m) => s + m.interior, 0),
    exterior: levels.reduce((s, m) => s + m.exterior, 0),
    total: levels.reduce((s, m) => s + m.total, 0),
    width: Math.max(...levels.map((m) => m.width), 0),
    depth: Math.max(...levels.map((m) => m.depth), 0),
  };
}

export function levelSubtitle(property: Property): string {
  if (property.subtitle) return property.subtitle;
  const m = propertyMetrics(property);
  const parts = [`${fmt(m.width)} m de frente`, `interior ≈ ${fmtArea(m.interior)}`];
  if (m.exterior > 0.5) parts.push(`exterior ≈ ${fmtArea(m.exterior)}`);
  return parts.join(" · ");
}

/** Zócalo por defecto: el contorno del nivel con un volado parejo. */
export function plinthRects(level: Level, margin = 0.15): Rect[] {
  if (level.plinth) return level.plinth;
  const box = levelBBox(level);
  return [[box.x1 - margin, box.z1 - margin, box.x2 + margin, box.z2 + margin]];
}

export const levelFloorY = (level: Level) =>
  (level.elevation ?? LEVEL_DEFAULTS.elevation) +
  (level.floorThickness ?? LEVEL_DEFAULTS.floorThickness);
