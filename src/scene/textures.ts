import * as THREE from "three";

import type { Finish } from "../model/palette";

/**
 * Texturas procedurales, dibujadas en un canvas al arrancar.
 *
 * Son en ESCALA DE GRISES a propósito: se usan como `map`, que three multiplica
 * por el color del material. Así una sola textura de madera sirve para los cinco
 * tonos de madera de la paleta, en vez de una imagen por color. Y el proyecto
 * sigue sin depender de un solo archivo externo.
 *
 * Todas parten de blanco y sólo oscurecen: lo que se ve es la variación, no un
 * tinte encima del color autorado.
 */

const SIZE = 256;

/** Ruido determinista: la misma textura en cada carga, sin sorpresas. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function surface() {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  return { canvas, ctx };
}

/** Veta corrida a lo largo de la U, con poros. */
function wood() {
  const { canvas, ctx } = surface();
  const r = rng(1917);
  for (let i = 0; i < 70; i++) {
    const y = r() * SIZE;
    const thickness = 0.6 + r() * 2.6;
    const amp = 1 + r() * 3;
    const phase = r() * Math.PI * 2;
    ctx.fillStyle = `rgba(86,66,42,${0.03 + r() * 0.075})`;
    for (let x = 0; x < SIZE; x += 2) {
      ctx.fillRect(x, y + Math.sin((x / SIZE) * Math.PI * 2 + phase) * amp, 2, thickness);
    }
  }
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(70,52,32,${0.05 + r() * 0.1})`;
    ctx.fillRect(r() * SIZE, r() * SIZE, 1 + r() * 3, 1);
  }
  return canvas;
}

/** Duela: tablones con junta, y la veta corriendo dentro de cada uno. */
function planks() {
  const { canvas, ctx } = surface();
  const r = rng(4242);
  const rows = 5;
  const h = SIZE / rows;
  for (let row = 0; row < rows; row++) {
    const y = row * h;
    // Un tono por tablón, para que no se lean todos iguales.
    ctx.fillStyle = `rgba(96,74,48,${r() * 0.055})`;
    ctx.fillRect(0, y, SIZE, h);
    // Veta interior.
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = `rgba(86,66,42,${0.02 + r() * 0.05})`;
      ctx.fillRect(0, y + 2 + r() * (h - 4), SIZE, 0.6 + r() * 1.2);
    }
    // Junta larga y una junta de tope, alternada por hilada.
    ctx.fillStyle = "rgba(60,42,26,0.3)";
    ctx.fillRect(0, y, SIZE, 1.6);
    const joint = ((row % 2) * 0.5 + 0.25) * SIZE;
    ctx.fillRect(joint, y, 1.6, h);
  }
  return canvas;
}

/** Azulejo con junta. */
function tile() {
  const { canvas, ctx } = surface();
  const r = rng(909);
  const n = 4;
  const s = SIZE / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      ctx.fillStyle = `rgba(40,48,52,${r() * 0.05})`;
      ctx.fillRect(i * s, j * s, s, s);
    }
  }
  ctx.fillStyle = "rgba(52,58,62,0.22)";
  for (let i = 0; i <= n; i++) {
    ctx.fillRect(i * s - 1.2, 0, 2.4, SIZE);
    ctx.fillRect(0, i * s - 1.2, SIZE, 2.4);
  }
  return canvas;
}

/** Trama de tela: hilos cruzados finos. */
function fabric() {
  const { canvas, ctx } = surface();
  for (let x = 0; x < SIZE; x += 3) {
    ctx.fillStyle = "rgba(40,34,26,0.05)";
    ctx.fillRect(x, 0, 1.5, SIZE);
  }
  for (let y = 0; y < SIZE; y += 3) {
    ctx.fillStyle = "rgba(40,34,26,0.045)";
    ctx.fillRect(0, y, SIZE, 1.5);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(0, y + 1.5, SIZE, 1.5);
  }
  return canvas;
}

/** Aplanado: grano muy fino, apenas para que el muro no sea un plano muerto. */
function plaster() {
  const { canvas, ctx } = surface();
  const image = ctx.getImageData(0, 0, SIZE, SIZE);
  const r = rng(31337);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = 246 + r() * 9;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = n;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** Encimera: moteado fino de piedra. */
function stone() {
  const { canvas, ctx } = surface();
  const r = rng(555);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(60,54,44,${0.03 + r() * 0.09})`;
    ctx.fillRect(r() * SIZE, r() * SIZE, 0.8 + r() * 1.6, 0.8 + r() * 1.6);
  }
  return canvas;
}

const MAKERS: Partial<Record<Finish, () => HTMLCanvasElement>> = {
  wood,
  planks,
  tile,
  fabric,
  plaster,
  stone,
};

const bases = new Map<Finish, THREE.CanvasTexture>();
const variants = new Map<string, THREE.Texture>();

/**
 * Textura de un acabado con una repetición dada. El clon comparte el canvas, así
 * que repetir sale prácticamente gratis: lo único propio es la matriz de UV.
 */
export function getTexture(finish: Finish, rx: number, ry: number): THREE.Texture | null {
  const make = MAKERS[finish];
  if (!make) return null;

  let base = bases.get(finish);
  if (!base) {
    base = new THREE.CanvasTexture(make());
    base.wrapS = base.wrapT = THREE.RepeatWrapping;
    base.colorSpace = THREE.SRGBColorSpace;
    base.anisotropy = 4;
    bases.set(finish, base);
  }

  const key = `${finish}|${rx.toFixed(2)}|${ry.toFixed(2)}`;
  let variant = variants.get(key);
  if (!variant) {
    variant = base.clone();
    variant.needsUpdate = true;
    variant.repeat.set(rx, ry);
    variants.set(key, variant);
  }
  return variant;
}
