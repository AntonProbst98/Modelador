/**
 * Esquema de una propiedad. Es data pura: ningún archivo de `properties/`
 * importa three.js. El motor de `scene/` sabe dibujar cualquier cosa que
 * cumpla con esto, así que agregar una casa = agregar un archivo de datos.
 */

import type { CatalogProps, FurnitureType } from "./catalog";
import type { RoomKind } from "./palette";

/** Rectángulo en planta: [x1, z1, x2, z2] en metros, con x1<x2 y z1<z2. */
export type Rect = [number, number, number, number];

/** Una pieza de mobiliario colocada: tipo + posición + giro + params del catálogo. */
export type Furniture = {
  [K in FurnitureType]: {
    type: K;
    /** centro de la pieza, en metros */
    x: number;
    z: number;
    /** giro en grados sobre Y; el frente del mueble mira a -z cuando rot = 0 */
    rot?: number;
    /** apoya la pieza sobre otra (barra, repisa) en vez de sobre el piso */
    y?: number;
    /** a qué cuarto pertenece; sirve para filtrar y para el panel de detalle */
    room?: string;
  } & CatalogProps[K];
}[FurnitureType];

export interface Room {
  id: string;
  name: string;
  kind: RoomKind;
  /** El cuarto es la unión de estos rectángulos; de aquí sale el área. */
  rects: Rect[];
  /** Sobreescribe el color por tipo de cuarto. */
  color?: string;
  /** Posición de la etiqueta; por defecto, el centro del rectángulo más grande. */
  labelAt?: [number, number];
  labelScale?: number;
  /** Nota corta para la leyenda, p.ej. "3.6 × 3.75". Si falta, se calcula. */
  note?: string;
  /** Excluir del área interior (terrazas, patios). Por defecto true en `outdoor`. */
  interior?: boolean;
}

/**
 * Hueco acristalado en un muro. Su `rect` marca el tramo en planta; el espesor
 * se toma del muro que atraviesa, así que basta con dibujarlo sobre el muro.
 *
 * Alturas medidas desde el piso terminado:
 *
 *     head  ─────────────  dintel (por defecto, alto del muro)
 *           ░░░ vidrio ░░░
 *     sill+base ─────────
 *           ███ base ████  panel opaco de la propia cancelería
 *     sill  ─────────────  antepecho
 *           ███ muro ████
 *     0     ─────────────  piso
 */
export interface Opening {
  rect: Rect;
  /** `door` = se cruza a pie, así que el piso sigue; `window` = no. */
  type: "door" | "window";
  /** Altura del antepecho de obra. 0 = arranca del piso. */
  sill?: number;
  /** Altura del dintel. Por defecto, el alto del muro. */
  head?: number;
  /** Panel opaco de la cancelería sobre el antepecho (corrediza mixta). */
  base?: number;
  /** Para acordarte de qué es al leer el archivo. */
  note?: string;
}

/**
 * Cota: un tramo del plano con una letra, para poder cotejarlo contra la cinta.
 * El largo NO se escribe aquí — sale del rectángulo, así que la lista de cotas
 * siempre dice lo que el modelo realmente mide, no lo que uno quisiera.
 */
export interface Dimension {
  /** Letra que se dibuja en el plano: "A", "B", … */
  id: string;
  /** Qué se está midiendo, en palabras. */
  label: string;
  /** El tramo. Su lado largo es la medida; el corto sólo le da grosor. */
  rect: Rect;
}

export interface Level {
  id: string;
  name: string;
  /** Altura del piso terminado sobre el nivel del terreno. */
  elevation?: number;
  /** Espesor de la losa de piso. */
  floorThickness?: number;
  /** Altura real de los muros cuando se ven "completos". */
  wallHeight?: number;
  rooms: Room[];
  /** Muros de fachada y colindancias. */
  extWalls: Rect[];
  /** Muros divisorios. */
  intWalls: Rect[];
  /** Vanos: el piso continúa, el muro no. */
  thresholds: Rect[];
  /** Ventanas y cancelería. Se recortan de los muros al armar la geometría. */
  openings?: Opening[];
  /** Cotas con letra, para verificar el levantamiento con cinta en mano. */
  dims?: Dimension[];
  /** Arco de abatimiento de puerta: bisagra, radio y ángulo inicial en grados. */
  doorSwings: { x: number; z: number; r: number; from: number }[];
  furniture: Furniture[];
  /** Zócalo/plataforma bajo la construcción. Si falta, se deriva del contorno. */
  plinth?: Rect[];
  /** Marcador de acceso, con su etiqueta. */
  entry?: { x: number; z: number; label?: string };
}

/**
 * Un escenario: el mismo depto con obra encima. No copia la planta — recibe el
 * nivel base y devuelve el modificado, así que cada corrección al levantamiento
 * se propaga sola a todos los escenarios en vez de haber que aplicarla n veces.
 */
export interface Scenario {
  id: string;
  name: string;
  /** Qué cambia, en una línea. */
  summary?: string;
  apply: (base: Level) => Level;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  /** Línea corta bajo el título. Si falta, se arma con las áreas calculadas. */
  subtitle?: string;
  levels: Level[];
  /** Alternativas de obra sobre el estado actual. El base siempre es el primero. */
  scenarios?: Scenario[];
}

/** Defaults de nivel, en un solo lugar para no repetirlos en cada propiedad. */
export const LEVEL_DEFAULTS = {
  elevation: 0,
  floorThickness: 0.08,
  wallHeight: 2.45,
} as const;
