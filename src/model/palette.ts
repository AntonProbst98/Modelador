/**
 * Paleta única del modelador. Todo color del proyecto sale de aquí:
 * si quieres cambiar el "look" de las tres capas (estructura, cuartos,
 * mobiliario) se cambia en este archivo y nada más.
 */

export const PAL = {
  // ---- estructura ----
  wall: "#f2ecdf",
  wallEdge: "#e2d9c6",
  threshold: "#cdb693",
  plinth: "#8f8069",
  doorArc: "#9b7f5e",

  // ---- materiales de mobiliario ----
  white: "#f3f2ee",
  wood: "#b6a488",
  woodDark: "#8b7355",
  woodWarm: "#c9a877",
  counterTop: "#efeade",
  dark: "#26262a",
  steel: "#cfd8da",
  linen: "#e4ddd0",
  glass: "#bcd7dc",
  tile: "#e8eef0",
  leaf: "#6f9a5d",
  pot: "#b5714f",
  fabric: "#93a1ad",
  screen: "#17181b",
  stone: "#cabfae",
} as const;

/** Color de piso por tipo de cuarto. Un cuarto puede sobreescribirlo con `color`. */
export const ROOM_COLORS = {
  bedroom: "#e9d4b7",
  bath: "#ccd7d5",
  kitchen: "#d9d2c4",
  living: "#e0cdae",
  outdoor: "#a9c19b",
  service: "#d3d8cd",
  circulation: "#d8c6a8",
} as const;

export type RoomKind = keyof typeof ROOM_COLORS;

export const ROOM_KIND_LABEL: Record<RoomKind, string> = {
  bedroom: "Recámara",
  bath: "Baño",
  kitchen: "Cocina",
  living: "Social",
  outdoor: "Exterior",
  service: "Servicio",
  circulation: "Circulación",
};

/**
 * Acabados. Deciden textura y rugosidad, no color.
 *
 * El acabado se deduce del color porque la paleta ya es, de hecho, una tabla de
 * acabados: no hay dos maderas con el mismo tono ni una tela del color de un
 * azulejo. Las piezas que usan un color suelto pueden forzarlo con `finish`.
 */
export type Finish = "wood" | "planks" | "tile" | "fabric" | "plaster" | "stone" | "gloss" | "plain";

export const FINISH_ROUGHNESS: Record<Finish, number> = {
  wood: 0.72,
  planks: 0.68,
  tile: 0.32,
  fabric: 0.95,
  plaster: 0.95,
  stone: 0.5,
  gloss: 0.22,
  plain: 0.9,
};

const FINISH_BY_COLOR: Record<string, Finish> = {
  [PAL.wood]: "wood",
  [PAL.woodDark]: "wood",
  [PAL.woodWarm]: "wood",
  [PAL.counterTop]: "stone",
  [PAL.stone]: "stone",
  [PAL.linen]: "fabric",
  [PAL.fabric]: "fabric",
  [PAL.tile]: "tile",
  [PAL.wall]: "plaster",
  [PAL.wallEdge]: "plaster",
  [PAL.threshold]: "wood",
  [PAL.plinth]: "stone",
  [PAL.white]: "gloss",
  [PAL.steel]: "gloss",
  [PAL.screen]: "plain",
  [PAL.dark]: "plain",
  [PAL.glass]: "plain",
  [PAL.leaf]: "plain",
  [PAL.pot]: "stone",
  // Colores sueltos del catálogo que sí tienen acabado claro.
  "#9b8ea4": "fabric", // cobija de la cama
  "#7d8ea0": "fabric",
  "#c9b18a": "fabric", // camastro
  "#cbb9a0": "fabric", // tapetes
  "#d6c3a8": "fabric",
  "#bfa287": "fabric",
  "#8d7a5f": "wood", // mesa de terraza
  "#7e6c53": "wood", // bancos
  "#5a5148": "wood", // cabina de DJ
  "#6f6152": "wood", // nicho del mueble de TV
  "#eef0f1": "gloss", // refrigerador
  "#f6f4ef": "stone", // cubierta del lavabo
  "#8fa6b5": "gloss",
  "#dfe5e6": "gloss",
};

export const finishFor = (color: string): Finish => FINISH_BY_COLOR[color] ?? "plain";

/** Acabado del piso según el uso del cuarto. */
export const FLOOR_FINISH: Record<RoomKind, Finish> = {
  bedroom: "planks",
  bath: "tile",
  kitchen: "tile",
  living: "planks",
  outdoor: "stone",
  service: "tile",
  circulation: "planks",
};

/** Fondo del lienzo, compartido entre el canvas y el CSS de la página. */
export const BACKDROP = "linear-gradient(160deg,#f8f3e9 0%,#efe6d4 55%,#e4d8c1 100%)";
