/**
 * Catálogo de mobiliario paramétrico.
 *
 * Cada entrada de `CatalogProps` declara los parámetros de un mueble y cada
 * builder de `BUILDERS` lo arma con primitivas locales. Amueblar una propiedad
 * es escribir `{ type: "bed", x, z, rot }`, no repetir cajas con coordenadas
 * mágicas.
 *
 * Convención: el FRENTE de un mueble mira hacia -z local. Con `rot` en grados
 * (0 = frente al norte del plano, 90 = frente al oeste, etc.) lo orientas.
 */

import { PAL } from "./palette";
import { b, cy, sp, type Part } from "./parts";

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Pieza sin parámetros. No es `Record<string, never>`: eso prohibiría también `x`/`z`/`rot`. */
type NoProps = Record<never, never>;

export interface CatalogProps {
  /** Caja genérica. Escotilla de escape para modelar rápido algo sin pieza propia. */
  block: { w: number; h: number; d: number; c?: string };
  /** Placa delgada a ras de piso (tapetes, plataformas, andadores). */
  rug: { w: number; d: number; c?: string; round?: boolean };

  bed: { w?: number; l?: number; sheet?: string; cover?: string; pillows?: number };
  nightstand: { s?: number; h?: number; c?: string };
  wardrobe: { w?: number; h?: number; d?: number; c?: string };
  desk: { l?: number; d?: number; h?: number; c?: string };
  monitor: { w?: number; h?: number };
  djBooth: { w?: number; d?: number; h?: number };

  counter: { l: number; d?: number; h?: number; c?: string };
  cooktop: { w?: number; d?: number };
  sinkTop: { w?: number; d?: number };
  fridge: { w?: number; h?: number; d?: number };

  vanity: { w?: number; d?: number; h?: number };
  toilet: NoProps;
  pedestalSink: NoProps;
  shower: { w?: number; d?: number; glass?: boolean };

  washerStack: { w?: number; h?: number; d?: number };
  utilitySink: { w?: number; h?: number; d?: number };

  diningSet: { r?: number; seats?: number; ring?: number; c?: string };
  roundTable: { r?: number; h?: number; c?: string };
  stool: { s?: number; c?: string };
  sofa: { w?: number; d?: number; c?: string };
  coffeeTable: { w?: number; d?: number; h?: number; c?: string };
  tvUnit: { w?: number; d?: number; tv?: number };
  sideboard: { w?: number; h?: number; d?: number; c?: string };
  lounger: { w?: number; l?: number; c?: string };

  plant: { s?: number };
  marker: { c?: string };
}

export type FurnitureType = keyof CatalogProps;

type Builder<K extends FurnitureType> = (p: CatalogProps[K]) => Part[];
type Builders = { [K in FurnitureType]: Builder<K> };

export const BUILDERS: Builders = {
  block: ({ w, h, d, c = PAL.wood }) => [b(w, h, d, 0, h / 2, 0, c)],

  rug: ({ w, d, c = PAL.woodWarm, round }) =>
    round
      ? [cy(w / 2, 0.02, 0, 0.01, 0, c, { cast: false, seg: 40 })]
      : [b(w, 0.02, d, 0, 0.01, 0, c, { cast: false })],

  bed: ({ w = 1.6, l = 2.0, sheet = PAL.linen, cover = "#9b8ea4", pillows = 2 }) => {
    const parts: Part[] = [
      b(w, 0.38, l, 0, 0.19, 0, sheet),
      b(w, 0.72, 0.08, 0, 0.36, -l / 2 + 0.04, PAL.woodDark),
      b(w + 0.02, 0.06, l / 2, 0, 0.41, l * 0.22, cover),
    ];
    const pw = pillows > 1 ? w * 0.39 : w * 0.72;
    for (let i = 0; i < pillows; i++) {
      const x = pillows === 1 ? 0 : (i - (pillows - 1) / 2) * (w * 0.44);
      parts.push(b(pw, 0.1, 0.3, x, 0.43, -l / 2 + 0.28, PAL.white));
    }
    return parts;
  },

  nightstand: ({ s = 0.45, h = 0.42, c = PAL.wood }) => [b(s, h, s, 0, h / 2, 0, c)],

  wardrobe: ({ w = 1.7, h = 1.3, d = 0.5, c = PAL.wood }) => [
    b(w, h, d, 0, h / 2, 0, c),
    b(0.03, 0.22, 0.03, -w * 0.06, h * 0.55, -d / 2 - 0.02, PAL.steel),
    b(0.03, 0.22, 0.03, w * 0.06, h * 0.55, -d / 2 - 0.02, PAL.steel),
  ],

  desk: ({ l = 1.3, d = 0.55, h = 0.7, c = PAL.wood }) => [
    b(l, h, d, 0, h / 2, 0, c),
    b(l + 0.04, 0.04, d + 0.04, 0, h + 0.02, 0, PAL.counterTop),
  ],

  monitor: ({ w = 0.5, h = 0.32 }) => [
    b(w, h, 0.04, 0, 0.13 + h / 2, 0, PAL.dark),
    b(w * 0.3, 0.1, 0.12, 0, 0.05, 0, PAL.dark),
    b(w * 0.5, 0.02, 0.16, 0, 0.01, 0, PAL.dark),
  ],

  djBooth: ({ w = 1.4, d = 0.5, h = 0.8 }) => [
    b(w, h, d, 0, h / 2, 0, "#5a5148"),
    cy(0.16, 0.05, -w * 0.3, h + 0.055, 0, PAL.dark),
    cy(0.16, 0.05, w * 0.3, h + 0.055, 0, PAL.dark),
    b(0.3, 0.06, 0.34, 0, h + 0.06, 0, "#333333"),
  ],

  counter: ({ l, d = 0.55, h = 0.8, c = PAL.wood }) => [
    b(l, h, d, 0, h / 2, 0, c),
    b(l + 0.04, 0.05, d + 0.04, 0, h + 0.025, 0, PAL.counterTop),
  ],

  cooktop: ({ w = 0.6, d = 0.5 }) => {
    const parts: Part[] = [b(w, 0.02, d, 0, 0.865, 0, "#3b3b3d", { cast: false })];
    for (const dx of [-0.15, 0.15])
      for (const dz of [-0.13, 0.13])
        parts.push(cy(0.08, 0.012, dx, 0.88, dz, "#1e1e1e", { cast: false }));
    return parts;
  },

  sinkTop: ({ w = 0.6, d = 0.36 }) => [
    b(w, 0.02, d, 0, 0.865, 0, PAL.steel, { cast: false }),
    b(0.04, 0.22, 0.04, 0, 0.98, -d / 2 + 0.04, PAL.steel),
  ],

  fridge: ({ w = 0.72, h = 1.8, d = 0.7 }) => [
    b(w, h, d, 0, h / 2, 0, "#eef0f1"),
    b(0.03, 0.6, 0.04, -w * 0.35, h * 0.6, -d / 2 - 0.02, PAL.steel),
  ],

  vanity: ({ w = 1.2, d = 0.48, h = 0.8 }) => [
    b(w, h, d, 0, h / 2, 0, PAL.stone),
    b(w + 0.04, 0.05, d + 0.04, 0, h + 0.025, 0, "#f6f4ef"),
    cy(0.15, 0.06, 0, h + 0.075, 0, PAL.tile, { rb: 0.12 }),
    b(0.04, 0.2, 0.04, 0, h + 0.15, -d / 2 + 0.06, PAL.steel),
  ],

  toilet: () => [
    b(0.38, 0.3, 0.52, 0, 0.15, 0.05, PAL.white),
    b(0.4, 0.48, 0.14, 0, 0.32, -0.25, PAL.white),
  ],

  pedestalSink: () => [
    cy(0.07, 0.7, 0, 0.35, 0, PAL.white, { rb: 0.11 }),
    cy(0.23, 0.06, 0, 0.73, 0, PAL.white),
    b(0.03, 0.16, 0.03, 0, 0.84, -0.14, PAL.steel),
  ],

  shower: ({ w = 1.7, d = 0.75, glass = true }) => {
    const parts: Part[] = [b(w, 0.05, d, 0, 0.025, 0, PAL.tile, { cast: false })];
    if (glass)
      parts.push(b(w, 1.0, 0.04, 0, 0.5, -d / 2 + 0.02, PAL.glass, { opacity: 0.35, cast: false }));
    return parts;
  },

  washerStack: ({ w = 0.62, h = 1.35, d = 0.62 }) => [
    b(w, h, d, 0, h / 2, 0, PAL.white),
    cy(0.18, 0.03, 0, h * 0.31, -d / 2 - 0.01, "#8fa6b5", { rot: [90, 0, 0] }),
    cy(0.18, 0.03, 0, h * 0.72, -d / 2 - 0.01, "#8fa6b5", { rot: [90, 0, 0] }),
  ],

  utilitySink: ({ w = 0.5, h = 0.8, d = 0.5 }) => [
    b(w, h, d, 0, h / 2, 0, PAL.steel),
    b(w + 0.04, 0.06, d + 0.04, 0, h + 0.03, 0, "#dfe5e6"),
  ],

  diningSet: ({ r = 0.75, seats = 4, ring = 1.15, c = PAL.woodWarm }) => {
    const parts: Part[] = [
      cy(r, 0.06, 0, 0.71, 0, c, { seg: 40 }),
      cy(0.09, 0.65, 0, 0.355, 0, PAL.woodDark, { rb: 0.13 }),
    ];
    for (let i = 0; i < seats; i++) {
      const a = rad(45 + (360 / seats) * i);
      const sx = Math.cos(a) * ring;
      const sz = Math.sin(a) * ring;
      const ry = 90 - (a * 180) / Math.PI;
      parts.push(b(0.4, 0.4, 0.4, sx, 0.2, sz, PAL.wood, { ry }));
      parts.push(
        b(0.4, 0.45, 0.05, sx + Math.cos(a) * 0.19, 0.505, sz + Math.sin(a) * 0.19, PAL.wood, {
          ry,
        }),
      );
    }
    return parts;
  },

  roundTable: ({ r = 0.42, h = 0.66, c = "#8d7a5f" }) => [
    cy(r, 0.05, 0, h, 0, c, { seg: 36 }),
    cy(0.05, h - 0.05, 0, (h - 0.05) / 2, 0, c, { rb: 0.09 }),
  ],

  stool: ({ s = 0.4, c = "#7e6c53" }) => [b(s, 0.42, s, 0, 0.21, 0, c)],

  sofa: ({ w = 2.2, d = 0.95, c = PAL.fabric }) => [
    b(w, 0.42, d, 0, 0.21, 0, c),
    b(w, 0.45, 0.2, 0, 0.635, d / 2 - 0.1, c),
    b(0.22, 0.52, d, -w / 2 + 0.11, 0.26, 0, c),
    b(0.22, 0.52, d, w / 2 - 0.11, 0.26, 0, c),
  ],

  coffeeTable: ({ w = 0.9, d = 0.5, h = 0.28, c = PAL.wood }) => [b(w, h, d, 0, h / 2, 0, c)],

  tvUnit: ({ w = 1.6, d = 0.35, tv = 0.78 }) => [
    b(w, 0.42, d, 0, 0.21, 0, PAL.woodDark),
    b(w * 0.88, tv, 0.05, 0, 0.42 + 0.14 + tv / 2, -d / 2 + 0.03, PAL.screen),
  ],

  sideboard: ({ w = 1.5, h = 0.68, d = 0.4, c = PAL.woodDark }) => [b(w, h, d, 0, h / 2, 0, c)],

  lounger: ({ w = 0.62, l = 1.5, c = "#c9b18a" }) => [
    b(w, 0.26, l, 0, 0.13, 0, c),
    b(w, 0.06, l * 0.35, 0, 0.29, -l / 2 + l * 0.2, c),
  ],

  plant: ({ s = 1 }) => [
    cy(0.2 * s, 0.3 * s, 0, 0.15 * s, 0, PAL.pot, { rb: 0.15 * s }),
    sp(0.28 * s, 0, 0.5 * s, 0, PAL.leaf),
  ],

  marker: ({ c = "#c2603f" }) => [cy(0.001, 0.4, 0, 0.2, 0, c, { rb: 0.14, seg: 20 })],
};

/** Arma las primitivas de una pieza. Devuelve [] si el tipo no existe (dato malo, no crash). */
export function buildParts<K extends FurnitureType>(type: K, props: CatalogProps[K]): Part[] {
  const builder = BUILDERS[type] as Builder<K> | undefined;
  return builder ? builder(props) : [];
}
