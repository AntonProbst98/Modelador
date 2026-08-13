/**
 * Ayudas de colocación del editor: huella de una pieza y pegado a muros.
 *
 * La huella se saca de las primitivas del catálogo, no de una tabla aparte, así
 * que un mueble nuevo o reparametrizado se pega bien sin tocar este archivo.
 */

import { buildParts } from "../model/catalog";
import type { Furniture, Rect } from "../model/types";

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Ancho y fondo de la pieza en sus ejes locales. */
export function localFootprint(piece: Furniture): { w: number; d: number } {
  const { type, x: _x, z: _z, rot: _rot, y: _y, room: _room, ...props } = piece;
  const parts = buildParts(type, props as never);
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const part of parts) {
    const hw = part.k === "box" ? part.w / 2 : part.r;
    const hd = part.k === "box" ? part.d / 2 : part.r;
    minX = Math.min(minX, part.x - hw);
    maxX = Math.max(maxX, part.x + hw);
    minZ = Math.min(minZ, part.z - hd);
    maxZ = Math.max(maxZ, part.z + hd);
  }
  if (!Number.isFinite(minX)) return { w: 0.4, d: 0.4 };
  return { w: maxX - minX, d: maxZ - minZ };
}

/** Huella ya girada, que es la que se compara contra los muros. */
export function worldFootprint(piece: Furniture): { w: number; d: number } {
  const { w, d } = localFootprint(piece);
  const a = rad(piece.rot ?? 0);
  const c = Math.abs(Math.cos(a));
  const s = Math.abs(Math.sin(a));
  return { w: w * c + d * s, d: w * s + d * c };
}

export interface SnapOptions {
  /** Retícula en metros. */
  grid: number;
  /** A qué distancia de un muro se considera que la pieza se le pega. */
  tolerance: number;
  walls: Rect[];
}

/**
 * Devuelve la posición final de la pieza: primero a la retícula, luego a ras de
 * muro si quedó cerca de uno. Sólo se pega a las caras del muro que la pieza
 * realmente enfrenta, para que no salte a un muro que tiene detrás.
 */
export function snapPosition(
  piece: Furniture,
  x: number,
  z: number,
  { grid, tolerance, walls }: SnapOptions,
): { x: number; z: number } {
  let nx = grid > 0 ? Math.round(x / grid) * grid : x;
  let nz = grid > 0 ? Math.round(z / grid) * grid : z;
  if (tolerance <= 0) return { x: round(nx), z: round(nz) };

  const { w, d } = worldFootprint(piece);
  for (const [wx1, wz1, wx2, wz2] of walls) {
    const overlapsZ = nz + d / 2 > wz1 - tolerance && nz - d / 2 < wz2 + tolerance;
    if (overlapsZ) {
      if (Math.abs(nx - w / 2 - wx2) < tolerance) nx = wx2 + w / 2;
      else if (Math.abs(nx + w / 2 - wx1) < tolerance) nx = wx1 - w / 2;
    }
    const overlapsX = nx + w / 2 > wx1 - tolerance && nx - w / 2 < wx2 + tolerance;
    if (overlapsX) {
      if (Math.abs(nz - d / 2 - wz2) < tolerance) nz = wz2 + d / 2;
      else if (Math.abs(nz + d / 2 - wz1) < tolerance) nz = wz1 - d / 2;
    }
  }
  return { x: round(nx), z: round(nz) };
}

const round = (n: number) => Math.round(n * 1000) / 1000;
