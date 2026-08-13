import * as THREE from "three";

import { FINISH_ROUGHNESS, finishFor, type Finish } from "../model/palette";
import { getTexture } from "./textures";

/**
 * Los materiales se comparten por color y acabado: el modelo tiene cientos de
 * piezas pero apenas dos docenas de combinaciones, y reusarlos baja mucho el
 * número de draw calls. El set es fijo y vive lo que vive la app, por eso el
 * caché es de módulo.
 */
const cache = new Map<string, THREE.Material>();

function memo<T extends THREE.Material>(key: string, make: () => T): T {
  const hit = cache.get(key);
  if (hit) return hit as T;
  const m = make();
  cache.set(key, m);
  return m;
}

export interface MaterialOptions {
  opacity?: number;
  /** Fuerza el acabado; por defecto se deduce del color. */
  finish?: Finish;
  /**
   * Cuántas veces se repite la textura sobre la cara. En muebles se deja en 1
   * (la cara es chica y la escala se lee bien); en pisos y muros se calcula del
   * tamaño real, para que la duela mida lo mismo en un cuarto que en otro.
   */
  repeat?: [number, number];
}

export function getMaterial(color: string, { opacity = 1, finish, repeat }: MaterialOptions = {}) {
  const kind = finish ?? finishFor(color);
  const [rx, ry] = repeat ?? [1, 1];
  return memo(`std|${color}|${opacity}|${kind}|${rx.toFixed(2)}|${ry.toFixed(2)}`, () => {
    // La textura es gris y entra como `map`: three la multiplica por el color,
    // así que una sola imagen sirve para todos los tonos de ese acabado.
    const map = opacity < 1 ? null : getTexture(kind, rx, ry);
    return new THREE.MeshStandardMaterial({
      color,
      map,
      roughness: FINISH_ROUGHNESS[kind],
      metalness: 0,
      transparent: opacity < 1,
      opacity,
      depthWrite: opacity >= 1,
    });
  });
}

/** Arcos de abatimiento: planos, sin luz, visibles desde ambas caras. */
export const getArcMaterial = (color: string) =>
  memo(`arc|${color}`, () =>
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    }),
  );

/** Resalte del cuarto seleccionado. */
export const getHighlightMaterial = (color: string) =>
  memo(`hl|${color}`, () =>
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28 }),
  );
