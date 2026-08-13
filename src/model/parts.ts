/**
 * "Partes": las primitivas con las que se arma un mueble.
 *
 * Van en coordenadas LOCALES del mueble:
 *   x = ancho (derecha +), z = fondo (hacia el frente del mueble +), y = alto desde el piso.
 * El motor las coloca en el mundo aplicando la posición y rotación de la pieza,
 * así que un mueble nunca conoce sus coordenadas reales.
 */

import type { Finish } from "./palette";

/** Acabado de la pieza. Si falta, se deduce del color. */
type WithFinish = { finish?: Finish };

export type Part =
  | {
      k: "box";
      w: number;
      h: number;
      d: number;
      /** centro de la caja */
      x: number;
      y: number;
      z: number;
      c: string;
      /** giro propio en grados sobre Y (para sillas en diagonal, etc.) */
      ry?: number;
      opacity?: number;
      /** proyecta sombra; apágalo en tapetes y placas delgadas */
      cast?: boolean;
    } & WithFinish
  | {
      k: "cyl";
      /** radio superior */
      r: number;
      /** radio inferior; por defecto igual a `r` */
      rb?: number;
      h: number;
      x: number;
      y: number;
      z: number;
      c: string;
      /** giro en grados [x, y, z]; usa [0,0,90] para acostar el cilindro sobre X */
      rot?: [number, number, number];
      seg?: number;
      opacity?: number;
      cast?: boolean;
    } & WithFinish
  | ({ k: "sphere"; r: number; x: number; y: number; z: number; c: string } & WithFinish);

/** Caja. Orden: medidas, centro, color. */
export const b = (
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  c: string,
  extra: Partial<Extract<Part, { k: "box" }>> = {},
): Part => ({ k: "box", w, h, d, x, y, z, c, ...extra });

/** Cilindro vertical (a menos que le pases `rot`). */
export const cy = (
  r: number,
  h: number,
  x: number,
  y: number,
  z: number,
  c: string,
  extra: Partial<Extract<Part, { k: "cyl" }>> = {},
): Part => ({ k: "cyl", r, h, x, y, z, c, ...extra });

/** Esfera, para follaje. */
export const sp = (r: number, x: number, y: number, z: number, c: string): Part => ({
  k: "sphere",
  r,
  x,
  y,
  z,
  c,
});
