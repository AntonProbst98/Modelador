import * as THREE from "three";
import { toCreasedNormals } from "three-stdlib";

/**
 * Cajas con el canto matado.
 *
 * Es la diferencia entre que el mobiliario se lea como mueble o como Lego: una
 * arista viva no existe en la realidad, y el ojo lo nota aunque no sepa por qué.
 * El bisel es de 2 cm, apenas visible de frente pero suficiente para que atrape
 * un reflejo en el borde.
 *
 * Sólo se usa en mobiliario. Los muros y las losas siguen con caja lisa: son
 * cientos de piezas grandes y planas donde el bisel no se nota y sí se paga.
 */

const EPS = 1e-5;
const RADIUS = 0.02;
const cache = new Map<string, THREE.BufferGeometry>();

/** Perfil de la cara con las cuatro esquinas redondeadas. */
function profile(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const rr = r - EPS;
  shape.absarc(EPS, EPS, EPS, -Math.PI / 2, -Math.PI, true);
  shape.absarc(EPS, h - rr * 2, EPS, Math.PI, Math.PI / 2, true);
  shape.absarc(w - rr * 2, h - rr * 2, EPS, Math.PI / 2, 0, true);
  shape.absarc(w - rr * 2, EPS, EPS, 0, -Math.PI / 2, true);
  return shape;
}

export function roundedBox(w: number, h: number, d: number): THREE.BufferGeometry {
  // El radio nunca puede pasar de la mitad del lado más corto, o la extrusión
  // se degenera. En piezas muy delgadas (un tapete de 2 cm) no vale la pena.
  const r = Math.min(RADIUS, w / 2.2, h / 2.2, d / 2.2);
  const key = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit) return hit;

  let geometry: THREE.BufferGeometry;
  if (r < 0.003) {
    geometry = new THREE.BoxGeometry(w, h, d);
  } else {
    geometry = new THREE.ExtrudeGeometry(profile(w, h, r), {
      depth: d - r * 2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: r - EPS,
      bevelThickness: r,
      curveSegments: 2,
    });
    geometry.center();
    geometry = toCreasedNormals(geometry, 0.4);
  }
  cache.set(key, geometry);
  return geometry;
}
