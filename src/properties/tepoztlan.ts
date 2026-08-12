/**
 * Casa · Tepoztlán — PLACEHOLDER.
 *
 * Todavía no hay levantamiento, así que la geometría de abajo es inventada y
 * sólo sirve como plantilla. Para hacerla real:
 *
 *   1. Elige una esquina de la casa como origen (0,0) y mide todo desde ahí,
 *      con x = frente y z = fondo, en metros.
 *   2. `extWalls` / `intWalls`: un [x1,z1,x2,z2] por tramo de muro. El espesor
 *      es la dimensión corta del rectángulo (0.16 exterior, 0.10 interior).
 *   3. `rooms`: un rectángulo por cuarto, a paño interior de sus muros. El área
 *      y las medidas de la ficha se calculan solas — no las escribas a mano.
 *   4. `thresholds`: el hueco de cada puerta, para que el piso siga y el muro no.
 *   5. `furniture`: `{ type, x, z, rot }` con los tipos de `model/catalog.ts`.
 *      El frente de cada mueble mira a -z cuando rot = 0.
 *
 * Si la casa tiene dos niveles, agrega un segundo objeto a `levels` con su
 * propia `elevation` — el selector de nivel aparece solo cuando hay más de uno.
 */

import type { Property, Rect } from "../model/types";

const extWalls: Rect[] = [
  [0, 0, 0.16, 9.0],
  [0.16, 0, 11.0, 0.16],
  [10.84, 0.16, 11.0, 9.0],
  [0.16, 8.84, 10.84, 9.0],
];

const intWalls: Rect[] = [
  [6.5, 0.16, 6.6, 3.4], // recámara / estancia
  [6.5, 4.3, 6.6, 5.4],
  [6.6, 5.3, 10.84, 5.4], // recámara / baño
];

export const tepoztlan: Property = {
  id: "tepoztlan",
  name: "Casa · Tepoztlán",
  location: "Tepoztlán, Morelos",
  subtitle: "Levantamiento pendiente — geometría de ejemplo",
  levels: [
    {
      id: "pb",
      name: "Planta baja",
      rooms: [
        {
          id: "estancia",
          name: "Estancia",
          kind: "living",
          rects: [[0.16, 0.16, 6.5, 8.84]],
          labelScale: 0.9,
        },
        {
          id: "recamara",
          name: "Recámara",
          kind: "bedroom",
          rects: [[6.6, 0.16, 10.84, 5.3]],
          labelScale: 0.75,
        },
        {
          id: "bano",
          name: "Baño",
          kind: "bath",
          rects: [[6.6, 5.4, 10.84, 8.84]],
          labelScale: 0.6,
        },
      ],
      extWalls,
      intWalls,
      thresholds: [[6.5, 3.4, 6.6, 4.3]],
      doorSwings: [{ x: 6.6, z: 4.3, r: 0.85, from: 90 }],
      entry: { x: 3.3, z: 9.4, label: "Acceso" },
      furniture: [
        { type: "bed", x: 8.7, z: 1.6, w: 1.6, l: 2.0, room: "recamara" },
        { type: "nightstand", x: 7.6, z: 0.75, room: "recamara" },
        { type: "nightstand", x: 9.8, z: 0.75, room: "recamara" },
        { type: "sofa", x: 3.3, z: 7.4, w: 2.2, d: 0.95, room: "estancia" },
        { type: "coffeeTable", x: 3.3, z: 6.3, room: "estancia" },
        { type: "diningSet", x: 3.3, z: 2.6, room: "estancia" },
        { type: "vanity", x: 7.6, z: 5.8, room: "bano" },
        { type: "toilet", x: 9.4, z: 5.85, room: "bano" },
        { type: "shower", x: 8.7, z: 8.2, w: 1.7, d: 0.9, rot: 180, room: "bano" },
        { type: "plant", x: 0.8, z: 8.2, s: 1.1, room: "estancia" },
      ],
    },
  ],
};
