import * as THREE from "three";

/**
 * Los materiales se comparten por color: el modelo tiene cientos de piezas pero
 * apenas dos docenas de acabados, y reusarlos baja mucho el número de draw calls.
 * El set es fijo y vive lo que vive la app, por eso el caché es de módulo.
 */
const cache = new Map<string, THREE.Material>();

function memo<T extends THREE.Material>(key: string, make: () => T): T {
  const hit = cache.get(key);
  if (hit) return hit as T;
  const m = make();
  cache.set(key, m);
  return m;
}

export const getMaterial = (color: string, opacity = 1, roughness = 0.9) =>
  memo(`std|${color}|${opacity}|${roughness}`, () =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0,
      transparent: opacity < 1,
      opacity,
      depthWrite: opacity >= 1,
    }),
  );

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
