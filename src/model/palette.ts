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

/** Fondo del lienzo, compartido entre el canvas y el CSS de la página. */
export const BACKDROP = "linear-gradient(160deg,#f8f3e9 0%,#efe6d4 55%,#e4d8c1 100%)";
