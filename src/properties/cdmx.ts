/**
 * Depto · San Miguel Chapultepec, CDMX.
 *
 * Sistema de ejes del levantamiento: x = 0..9.6 (frente, izq→der del croquis),
 * z = 0..11 (fondo). Todo en metros, a paño de muro.
 */

import type { Property, Rect } from "../model/types";

const rooms = [
  {
    id: "terraza",
    name: "Terraza",
    kind: "outdoor" as const,
    rects: [
      [0.16, 0.16, 5.85, 2.45],
      [0.16, 2.45, 2.15, 3.75],
    ] as Rect[],
    labelAt: [2.9, 1.35] as [number, number],
    labelScale: 1,
  },
  {
    id: "principal",
    name: "Cuarto principal",
    kind: "bedroom" as const,
    rects: [[5.95, 0.16, 9.44, 3.65]] as Rect[],
    color: "#ecd7ba",
    labelAt: [7.7, 1.9] as [number, number],
    labelScale: 0.78,
  },
  {
    id: "anton",
    name: "Cuarto Antón",
    kind: "bedroom" as const,
    rects: [[2.25, 2.55, 5.85, 5.5]] as Rect[],
    color: "#e6d2b4",
    labelAt: [4.05, 4.05] as [number, number],
    labelScale: 0.85,
  },
  {
    id: "vestibulo",
    name: "Vestíbulo · pasillo",
    kind: "circulation" as const,
    rects: [[5.95, 3.75, 6.95, 7.4]] as Rect[],
    labelScale: 0.5,
  },
  {
    id: "lavanderia",
    name: "Lavandería",
    kind: "service" as const,
    rects: [[0.16, 3.85, 2.15, 5.5]] as Rect[],
    labelAt: [1.15, 4.6] as [number, number],
    labelScale: 0.55,
  },
  {
    id: "cocina",
    name: "Cocina",
    kind: "kitchen" as const,
    rects: [[0.16, 5.6, 5.85, 7.4]] as Rect[],
    labelAt: [2.95, 6.5] as [number, number],
    labelScale: 0.75,
  },
  {
    id: "bano-ppal",
    name: "Baño principal",
    kind: "bath" as const,
    rects: [[7.05, 3.75, 9.44, 5.5]] as Rect[],
    color: "#ccd7d5",
    labelAt: [8.2, 4.6] as [number, number],
    labelScale: 0.6,
  },
  {
    id: "bano-visitas",
    name: "Baño de visitas",
    kind: "bath" as const,
    rects: [[7.05, 5.6, 9.44, 7.4]] as Rect[],
    color: "#c7d3d1",
    labelAt: [8.2, 6.8] as [number, number],
    labelScale: 0.58,
  },
  {
    id: "sala",
    name: "Sala · Comedor",
    kind: "living" as const,
    rects: [
      [0.16, 7.5, 9.44, 9.84],
      [0.16, 9.84, 6.9, 10.84],
    ] as Rect[],
    labelAt: [4.6, 9.5] as [number, number],
    labelScale: 0.95,
  },
];

const extWalls: Rect[] = [
  [0, 0, 0.16, 11.0], // colindancia izquierda
  [0.16, 0, 9.6, 0.16], // fachada / terraza
  [9.44, 0.16, 9.6, 10.0], // colindancia derecha, hasta el recorte
  [6.9, 9.84, 9.44, 10.0], // recorte, tramo horizontal
  [6.9, 10.0, 7.06, 10.84], // recorte, tramo vertical
  [0.16, 10.84, 0.35, 11.0], // fondo, tramo corto
  [1.25, 10.84, 7.06, 11.0], // fondo (hueco de entrada 0.35–1.25)
];

const intWalls: Rect[] = [
  [2.2, 2.45, 5.85, 2.55], // terraza / cuarto Antón
  [2.15, 2.45, 2.25, 5.5], // extensión + lavandería / cuarto Antón
  [0.16, 3.75, 0.5, 3.85], // extensión / lavandería (paso 0.5–1.4)
  [1.4, 3.75, 2.15, 3.85],
  [5.85, 0.16, 5.95, 0.8], // terraza / cuarto principal (puerta 0.8–1.7)
  [5.85, 1.7, 5.95, 2.55],
  [5.85, 2.55, 5.95, 4.4], // Antón / vestíbulo (puerta 4.4–5.25)
  [5.85, 5.25, 5.95, 6.2], // sigue como costado de cocina
  [0.16, 5.5, 0.5, 5.6], // muro medio (puerta cocina ↔ lavandería)
  [1.3, 5.5, 5.85, 5.6],
  [6.9, 3.65, 9.44, 3.75], // cuarto principal / vestíbulo (puerta 5.95–6.9)
  [6.95, 3.75, 7.05, 4.5], // vestíbulo / baño ppal (puerta 4.5–5.3)
  [6.95, 5.3, 7.05, 5.5],
  [6.95, 5.5, 9.44, 5.6], // baño ppal / baño visitas
  [6.95, 6.45, 7.05, 7.4], // pasillo / baño visitas (puerta 5.6–6.45)
  [0.85, 7.4, 5.85, 7.5], // cocina / comedor (paso a la izquierda)
  [6.95, 7.4, 9.44, 7.5], // baño visitas / comedor
];

const thresholds: Rect[] = [
  [5.85, 4.4, 5.95, 5.25], // cuarto Antón
  [5.95, 3.65, 6.9, 3.75], // cuarto principal
  [6.95, 4.5, 7.05, 5.3], // baño principal
  [6.95, 5.6, 7.05, 6.45], // baño de visitas
  [5.85, 0.8, 5.95, 1.7], // principal → terraza
  [0.5, 3.75, 1.4, 3.85], // extensión terraza → lavandería
  [0.5, 5.5, 1.3, 5.6], // lavandería → cocina
  [0.35, 10.84, 1.25, 11.0], // entrada
  [0.16, 7.4, 0.85, 7.5], // cocina → comedor
  [5.95, 7.4, 6.95, 7.5], // pasillo → comedor
  [5.85, 6.2, 5.95, 7.4], // cocina → pasillo
];

export const cdmx: Property = {
  id: "cdmx",
  name: "Depto · San Miguel Chapultepec",
  location: "Ciudad de México",
  levels: [
    {
      id: "pb",
      name: "Planta única",
      rooms,
      extWalls,
      intWalls,
      thresholds,
      doorSwings: [
        { x: 5.85, z: 5.25, r: 0.85, from: 90 }, // cuarto Antón
        { x: 6.9, z: 3.65, r: 0.9, from: 90 }, // cuarto principal
        { x: 7.05, z: 4.5, r: 0.8, from: 270 }, // baño principal
        { x: 7.05, z: 6.45, r: 0.8, from: 0 }, // baño de visitas
        { x: 5.85, z: 1.7, r: 0.85, from: 90 }, // principal → terraza
        { x: 1.25, z: 10.84, r: 0.85, from: 90 }, // entrada
        { x: 1.3, z: 5.6, r: 0.75, from: 180 }, // cocina → lavandería
      ],
      plinth: [
        [-0.15, -0.15, 9.75, 10.15],
        [-0.15, 10.15, 7.21, 11.15],
      ],
      entry: { x: 0.8, z: 11.4, label: "Entrada" },
      furniture: [
        // ---- cuarto principal ----
        { type: "bed", x: 7.8, z: 1.4, w: 1.6, l: 2.0, room: "principal" },
        { type: "nightstand", x: 6.68, z: 0.63, room: "principal" },
        { type: "nightstand", x: 8.92, z: 0.63, room: "principal" },
        { type: "wardrobe", x: 9.17, z: 2.6, rot: 90, w: 1.7, h: 1.3, d: 0.5, room: "principal" },

        // ---- baño principal ----
        { type: "vanity", x: 7.77, z: 4.05, w: 1.2, d: 0.48, room: "bano-ppal" },
        { type: "shower", x: 8.94, z: 4.62, rot: 90, w: 1.6, d: 0.9, room: "bano-ppal" },
        { type: "toilet", x: 8.15, z: 5.15, rot: 180, room: "bano-ppal" },

        // ---- cuarto Antón ----
        { type: "bed", x: 3.3, z: 3.55, rot: 90, w: 1.4, l: 2.0, pillows: 1, cover: "#7d8ea0", room: "anton" },
        { type: "rug", x: 4.6, z: 4.1, w: 1.1, d: 1.1, round: true, c: "#cbb9a0", room: "anton" },
        { type: "desk", x: 5.0, z: 2.9, l: 1.3, d: 0.55, room: "anton" },
        { type: "monitor", x: 5.0, z: 2.8, y: 0.74, room: "anton" },
        { type: "djBooth", x: 4.2, z: 5.15, room: "anton" },

        // ---- lavandería ----
        { type: "washerStack", x: 1.76, z: 4.2, rot: 90, room: "lavanderia" },
        { type: "utilitySink", x: 1.82, z: 5.15, room: "lavanderia" },

        // ---- cocina ----
        { type: "counter", x: 3.6, z: 5.925, l: 4.3, d: 0.55, room: "cocina" },
        { type: "cooktop", x: 3.0, z: 5.92, room: "cocina" },
        { type: "counter", x: 2.62, z: 7.1, l: 3.35, d: 0.5, room: "cocina" },
        { type: "sinkTop", x: 2.0, z: 7.1, rot: 180, room: "cocina" },
        { type: "fridge", x: 4.75, z: 7.0, room: "cocina" },

        // ---- baño de visitas ----
        { type: "pedestalSink", x: 8.0, z: 5.95, room: "bano-visitas" },
        { type: "toilet", x: 9.0, z: 6.0, room: "bano-visitas" },
        { type: "shower", x: 8.5, z: 7.0, w: 1.7, d: 0.75, room: "bano-visitas" },

        // ---- sala · comedor ----
        { type: "diningSet", x: 3.2, z: 8.9, r: 0.75, seats: 4, ring: 1.15, room: "sala" },
        { type: "tvUnit", x: 8.2, z: 7.7, w: 1.6, d: 0.35, room: "sala" },
        { type: "rug", x: 8.2, z: 8.75, w: 2.8, d: 2.4, c: "#d6c3a8", room: "sala" },
        { type: "coffeeTable", x: 8.2, z: 8.55, room: "sala" },
        { type: "sofa", x: 8.2, z: 9.3, w: 2.2, d: 0.95, room: "sala" },
        { type: "sideboard", x: 3.0, z: 10.58, room: "sala" },

        // ---- vestíbulo ----
        { type: "rug", x: 6.45, z: 5.4, w: 0.6, d: 3.2, c: "#bfa287", room: "vestibulo" },

        // ---- terraza ----
        { type: "roundTable", x: 3.9, z: 1.5, r: 0.42, h: 0.64, room: "terraza" },
        { type: "stool", x: 3.15, z: 1.5, room: "terraza" },
        { type: "stool", x: 4.65, z: 1.5, room: "terraza" },
        { type: "lounger", x: 2.35, z: 1.05, room: "terraza" },

        // ---- plantas ----
        { type: "plant", x: 0.55, z: 0.55, s: 1.15, room: "terraza" },
        { type: "plant", x: 1.35, z: 0.45, s: 0.85, room: "terraza" },
        { type: "plant", x: 5.45, z: 0.5, s: 0.95, room: "terraza" },
        { type: "plant", x: 0.5, z: 2.05, s: 0.9, room: "terraza" },
        { type: "plant", x: 0.9, z: 3.35, s: 1.0, room: "terraza" },
        { type: "plant", x: 1.8, z: 3.3, s: 0.75, room: "terraza" },
        { type: "plant", x: 0.55, z: 7.95, s: 0.95, room: "cocina" },
        { type: "plant", x: 5.35, z: 10.3, s: 1.0, room: "sala" },
      ],
    },
  ],
};
