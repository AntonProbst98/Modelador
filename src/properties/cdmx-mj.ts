/**
 * Escenario "MJ y Antón": el depto adaptado para vivirlo en pareja.
 *
 * No copia la planta. Recibe el nivel base y le aplica la obra, así que cada
 * corrección al levantamiento se propaga sola hasta acá.
 *
 * La obra, en orden:
 *
 *   1. Se cierra la sala de TV con tablaroca, prolongando la línea de la columna
 *      hasta la ventana del recorte, y se tapa la boca del pasillo de ese lado.
 *      Su entrada nueva es una puerta en el pasillo, entre el baño de visitas y
 *      la columna. Queda un cuarto cerrado con la esquina de ventana.
 *   2. El cuarto de Antón pasa a ser la sala de TV: da al patio, así que las
 *      reuniones lo usan sin cruzar por una recámara.
 *   3. En la recámara principal el clóset se va a lo largo del muro ciego del
 *      este, y la cama y los burós ocupan donde estaba el clóset — lejos de la
 *      corrediza al patio, que es lo que da privacidad.
 *   4. Cocina: el refrigerador se pasa a donde estaba la entrada y ese tramo se
 *      cierra; la entrada nueva sale de cortarle 0.90 a la barra del lado del
 *      muro de 1.00. La barra crece de fondo y se vuelve isla.
 *   5. Comedor: mesa rectangular para 6 en lugar de la redonda.
 *
 * Lo único que no está definido es el uso del cuarto que queda al cerrar la sala.
 */

import { clearRooms, clearTypes, patchRoom, withoutIn } from "../model/edits";
import type { Furniture, Level, Rect, Scenario } from "../model/types";
import { CDMX_AXES as A } from "./cdmx";

// Puerta nueva de la sala, en el costado del pasillo.
const PUERTA_SALA: [number, number] = [7.71, 8.61];

export const remodelMJ: Scenario = {
  id: "mj",
  name: "MJ y Antón",
  summary: "Sala cerrada · cuarto de Antón como sala de TV · isla en la cocina",

  apply: (base): Level => {
    const intWalls: Rect[] = [
      // Se abre la puerta de la sala en el costado del pasillo, y se cierra la
      // boca de ese lado con tablaroca hasta la ventana del recorte.
      ...withoutIn(
        base.intWalls,
        [A.X_PAS_E, 7.33, A.X_BANO, A.Z_PASILLO_FIN], // costado del pasillo
        [0.16, A.Z_COCINA, 4.16, A.Z_SOCIAL], // muro del último metro de la cocina
      ),
      [A.X_PAS_E, 7.33, A.X_BANO, PUERTA_SALA[0]],
      [A.X_PAS_E, PUERTA_SALA[1], A.X_BANO, A.Z_PASILLO_FIN],
      [A.X_COLUMNA_O, 8.78, A.X_COLUMNA_E, A.Z_RECORTE], // tablaroca
      [A.X_COLUMNA_E, A.Z_PASILLO_FIN, A.X_PAS_E, A.Z_PASILLO_FIN + 0.1],
      // Cocina: se cierra la entrada vieja (ahí va el refri) y la nueva sale de
      // cortarle 0.90 a la barra, junto al muro de 1.00 que ya existía. El tramo
      // de la isla NO lleva muro: la isla es la que cierra ese pedazo.
      [0.16, A.Z_COCINA, 1.06, A.Z_SOCIAL],
      [4.16, A.Z_COCINA, A.X_PAS_O, A.Z_SOCIAL],
    ];

    const thresholds: Rect[] = [
      ...withoutIn(base.thresholds, [0.16, A.Z_COCINA, 1.06, A.Z_SOCIAL]),
      [A.X_PAS_E, PUERTA_SALA[0], A.X_BANO, PUERTA_SALA[1]], // pasillo → sala
      [3.26, A.Z_COCINA, 4.16, A.Z_SOCIAL], // comedor → cocina, entrada nueva
    ];

    const doorSwings = [
      ...base.doorSwings.filter((d) => !(d.x === 1.06 && d.z === A.Z_COCINA)),
      { x: A.X_BANO, z: PUERTA_SALA[1], r: 0.87, from: 0 },
      { x: 4.16, z: A.Z_COCINA, r: 0.9, from: 90 },
    ];

    let rooms = patchRoom(base.rooms, "anton", {
      name: "Sala de TV",
      kind: "living",
      color: "#dbc7a6",
      labelScale: 0.8,
    });
    rooms = patchRoom(rooms, "sala-tv", {
      name: "Cuarto cerrado",
      kind: "bedroom",
      color: "#e2d3bd",
    });

    // Se vacían los cuartos que cambian de uso y se reamueblan.
    let furniture: Furniture[] = clearRooms(base.furniture, "anton");
    furniture = clearTypes(furniture, "sala-tv", "sofa", "rug", "coffeeTable");
    furniture = clearRooms(furniture, "principal");
    furniture = clearTypes(furniture, "cocina", "bar", "fridge");
    furniture = clearTypes(furniture, "comedor", "diningSet");

    furniture = [
      ...furniture,

      // ---- sala de TV nueva, en el cuarto de Antón ----
      // La tele contra el muro ciego del oeste; los sillones miran al patio.
      { type: "tvUnit", x: 2.62, z: 4.4, rot: 270, w: 1.6, d: 0.35, room: "anton" },
      { type: "rug", x: 4.1, z: 4.4, w: 2.0, d: 2.4, c: "#d6c3a8", room: "anton" },
      { type: "coffeeTable", x: 3.9, z: 4.4, rot: 90, room: "anton" },
      { type: "sofa", x: 5.3, z: 4.4, rot: 90, w: 2.2, d: 0.95, room: "anton" },
      { type: "plant", x: 2.75, z: 5.7, s: 0.95, room: "anton" },

      // ---- recámara principal reacomodada ----
      // Clóset a lo largo del muro ciego del este.
      {
        type: "wardrobe",
        x: A.X_DER - 0.3,
        z: 1.88,
        rot: 90,
        w: 3.44,
        h: 2.4,
        d: 0.6,
        room: "principal",
      },
      // Cama contra el muro del baño, de espaldas a la corrediza del patio.
      { type: "bed", x: 8.2, z: 3.5, rot: 180, w: 1.6, l: 2.0, room: "principal" },
      { type: "nightstand", x: 7.15, z: 4.3, room: "principal" },
      { type: "nightstand", x: 9.25, z: 4.3, room: "principal" },

      // ---- cocina de MJ ----
      // El refri ocupa la esquina de la entrada vieja; la barra se vuelve isla.
      { type: "fridge", x: 0.62, z: 8.03, w: 0.85, rot: 180, room: "cocina" },
      { type: "bar", x: 2.16, z: A.Z_COCINA, l: 2.2, d: 0.9, room: "cocina" },

      // ---- comedor ----
      { type: "diningRect", x: 2.9, z: 10.6, w: 1.8, d: 0.9, seats: 6, room: "comedor" },
    ];

    return { ...base, id: "mj", name: "MJ y Antón", rooms, intWalls, thresholds, doorSwings, furniture };
  },
};
