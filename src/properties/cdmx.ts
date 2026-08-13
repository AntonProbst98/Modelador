/**
 * Depto · San Miguel Chapultepec, CDMX.
 *
 * Ejes: x = frente (izq→der del croquis), z = fondo. Metros, a paño de muro.
 *
 * ─── LEVANTAMIENTO CON CINTA ─────────────────────────────────────────────────
 *
 * La distribución sale del croquis a mano (`croquis.png`). Las dimensiones son
 * de sitio; las medidas viejas tomadas con el iPhone quedaron descartadas.
 *
 * Las dos envolventes ya están encadenadas de punta a punta con medidas de
 * sitio; no queda ningún tramo estimado en ellas.
 *
 *   FRENTE 10.36 = 0.16 + cocina 5.00 + 0.10 + pasillo 2.00 + 0.10
 *                       + baño 2.84 + 0.16
 *   y por arriba:  0.16 + lavandería 2.10 + 0.10 + Antón 3.80 + 0.20
 *                       + suite 3.84 (0.90 + 0.10 + 2.84) + 0.16
 *
 *   FONDO  13.32 = 0.16 + terraza 2.50 + 0.10 + Antón 3.33 + 0.10
 *                       + cocina 2.22 + comedor 4.75 + 0.16
 *
 * El 4.75 del comedor es la medida "de la entrada de la cocina a la entrada del
 * depto", que es justo lo que cierra el fondo (cota U). El frente lo confirma
 * B + M: terraza 6.00 + recámara principal 3.84, más los tres muros.
 *
 * Con el fondo cerrado, el tramo corto de la esquina de ventana (cota AA) queda
 * despejado sin medirlo:
 *
 *     del muro del baño de visitas a la calle          = 5.45
 *     − sala de TV 4.00 (0.60 de mueble + 3.40 libres) = 1.45
 *     − el muro del recorte 0.16                       = 1.29
 *
 * Y dos comprobaciones cruzadas que caen exactas:
 *
 *     terraza 2.50 + Antón 3.33                     = 5.83  (mitad de arriba)
 *     recámara con clóset 4.41 + pasillo suite 1.42 = 5.83  (la suite entera)
 *
 * Esa igualdad es literal: la suite ocupa exactamente el mismo fondo que la
 * terraza más el cuarto de Antón, porque van lado a lado. Y de ahí sale que el
 * pasillo de la suite mide justo lo mismo que el baño: 1.42. No hay vestíbulo
 * entre el clóset y el baño.
 *
 * Cómo está organizado, que no es obvio desde el croquis:
 *
 *   · El cuarto principal es una SUITE. Tras su única puerta, un pasillo propio
 *     de 0.90 sube pegado al baño y desemboca directo en la recámara.
 *   · Las puertas de Antón y de la suite arrancan a la misma altura, lado a
 *     lado sobre el pasillo global. El cuarto de Antón vuela justo 0.90 sobre
 *     el pasillo: el hueco exacto de su puerta.
 *   · Los dos baños son iguales y están en espejo sobre el muro de la línea de
 *     puertas, con TODOS los muebles recargados en ese muro: el lavabo de uno
 *     queda exactamente detrás del lavabo del otro, y lo mismo el escusado y la
 *     salida de la regadera. Es la columna de plomería que comparten.
 *   · La columna parte el pasillo en dos carriles de 0.92 y prolonga la línea
 *     que separa el comedor de la sala de TV.
 *   · El recorte del edificio es una ESQUINA DE VENTANA: los dos tramos del
 *     recorte están acristalados igual que la fachada a la calle.
 *   · Entre cocina y comedor: entrada de 0.90, luego la barra de 3.10, y el
 *     último metro sí es muro, con el refrigerador recargado en esa esquina.
 *   · De la lavandería NO se sale a la terraza.
 *
 * Los clósets miden 0.60 pero no van todos igual:
 *   · Antón: monta sobre el muro de la cocina — 0.30 se come del cuarto y 0.30
 *     empuja hacia la cocina. Sus 3.33 de fondo SÍ incluyen esos 0.30.
 *   · Recámara principal: por dentro, contra el muro del baño, y sólo del ancho
 *     del baño — el pasillo pasa a un lado para entrar a la recámara.
 *   · Mueble de TV: por dentro, contra el muro del baño de visitas.
 *
 * Medidas de sitio aplicadas:
 *   · Altura de entrepiso     2.60
 *   · Puertas                 0.87 de hoja, 0.90 con marco
 *   · Cuarto Antón            3.80 × 3.33 (de corrediza a puerta)
 *   · Cocina                  5.00 × 2.22
 *   · Pasillo global          2.00 × 2.80
 *   · Baños                   2.84 × 1.42, en espejo
 *   · Terraza                 6.00 × 2.50 (2.00 sobre lavandería + 4.00)
 *   · Comedor                 5.00 de cocina + 0.92 hasta la columna
 *   · Sala de TV              0.92 + 2.84 de ancho × 3.40 libres + 0.60 mueble
 *   · Suite                   pasillo 0.90 × 1.42; recámara 4.41 con clóset
 *   · Cocina: entrada 0.90 + barra 3.10 + muro 1.00 = 5.00. El último metro
 *     es muro ciego, no barra, y el refrigerador va en esa esquina.
 *
 * Cotas L + O = 5.83, que es la comprobación de la suite.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Dimension, Property, Rect } from "../model/types";

// ---- ejes verticales ----
const X_LAV = 2.26; // cara este de la banda lavandería / extensión de terraza
const X_ANTON_O = 2.36;
const X_COCINA_E = 5.16; // cara este de la cocina (5.00 de ancho)
const X_PAS_O = 5.26; // el pasillo global mide 2.00
const X_ANTON_E = 6.16; // Antón vuela 0.90 sobre el pasillo: el hueco de su puerta
const X_COLUMNA_O = 6.18; // 0.92 desde la cocina: la línea comedor / sala
const X_COLUMNA_E = 6.3;
const X_SUITE = 6.36; // pasillo 0.90 + muro + baño 2.84 = 3.84
const X_PAS_E = 7.26; // costado este del pasillo global y del de la suite
const X_BANO = 7.36; // paño oeste de los dos baños (2.84 de ancho)
const X_DER = 10.2; // paño interior de la colindancia derecha
const X_MURO_DER = 10.36;

// ---- franjas de fondo ----
const Z_TERRAZA = 2.66; // 2.50: el largo de las dos corredizas
const Z_ANTON_N = 2.76;
const Z_RECAMARA = 3.97; // 3.81 libres de recámara
const Z_CLOSET_P = 4.57; // + 0.60 de clóset: 4.41 de fondo total (cota L)
const Z_SUITE = 4.67; // el pasillo de la suite corre pegado al baño: 1.42 (cota O)
const Z_PUERTAS = 6.09; // 3.33 desde la corrediza de Antón
const Z_SERVICIO = 6.19; // cocina, pasillo global y baño de visitas
const Z_BANO_V = 7.61; // baño de visitas: 1.42, igual que el principal
const Z_SALA = 7.71; // arranque de la sala de TV, contra el mueble de obra
const Z_COCINA = 8.41; // cocina: 2.22 de fondo
const Z_SOCIAL = 8.51; // tras el muro del último metro de la cocina
const Z_PASILLO_FIN = 8.99; // pasillo global: 2.80 de largo
const Z_RECORTE = 11.71; // sala: 0.60 de mueble + 3.40 libres
const Z_CALLE = 13.16;
const Z_FONDO = 13.32;

const rooms = [
  {
    id: "terraza",
    name: "Terraza",
    kind: "outdoor" as const,
    rects: [
      [0.16, 0.16, X_ANTON_E, Z_TERRAZA],
      [0.16, Z_ANTON_N, X_LAV, 3.99],
    ] as Rect[],
    labelAt: [3.1, 1.45] as [number, number],
    labelScale: 1,
  },
  {
    id: "principal",
    name: "Recámara principal",
    kind: "bedroom" as const,
    rects: [[X_SUITE, 0.16, X_DER, Z_CLOSET_P]] as Rect[],
    color: "#ecd7ba",
    labelAt: [8.28, 1.8] as [number, number],
    labelScale: 0.75,
  },
  {
    // Corre pegado al baño, del ancho de la puerta, y desemboca en la recámara.
    id: "pasillo-suite",
    name: "Pasillo de la suite",
    kind: "circulation" as const,
    rects: [[X_SUITE, Z_SUITE, X_PAS_E, Z_PUERTAS]] as Rect[],
    labelAt: [6.81, 5.38] as [number, number],
    labelScale: 0.42,
  },
  {
    id: "bano-ppal",
    name: "Baño principal",
    kind: "bath" as const,
    rects: [[X_BANO, Z_SUITE, X_DER, Z_PUERTAS]] as Rect[],
    color: "#ccd7d5",
    labelAt: [8.78, 5.4] as [number, number],
    labelScale: 0.45,
  },
  {
    id: "anton",
    name: "Cuarto Antón",
    kind: "bedroom" as const,
    rects: [[X_ANTON_O, Z_ANTON_N, X_ANTON_E, Z_PUERTAS]] as Rect[],
    color: "#e6d2b4",
    labelAt: [4.2, 4.0] as [number, number],
    labelScale: 0.85,
  },
  {
    id: "lavanderia",
    name: "Lavandería",
    kind: "service" as const,
    rects: [[0.16, 4.09, X_LAV, Z_PUERTAS]] as Rect[],
    labelAt: [1.2, 5.1] as [number, number],
    labelScale: 0.5,
  },
  {
    id: "cocina",
    name: "Cocina",
    kind: "kitchen" as const,
    rects: [[0.16, Z_SERVICIO, X_COCINA_E, Z_COCINA]] as Rect[],
    labelAt: [2.6, 7.3] as [number, number],
    labelScale: 0.75,
  },
  {
    id: "pasillo",
    name: "Pasillo",
    kind: "circulation" as const,
    rects: [[X_PAS_O, Z_SERVICIO, X_PAS_E, Z_PASILLO_FIN]] as Rect[],
    labelAt: [6.25, 6.6] as [number, number],
    labelScale: 0.5,
  },
  {
    id: "bano-visitas",
    name: "Baño visitas · Antón",
    kind: "bath" as const,
    rects: [[X_BANO, Z_SERVICIO, X_DER, Z_BANO_V]] as Rect[],
    color: "#c7d3d1",
    labelAt: [8.78, 6.9] as [number, number],
    labelScale: 0.45,
  },
  {
    id: "comedor",
    name: "Comedor",
    kind: "living" as const,
    rects: [
      [0.16, Z_COCINA, 4.16, Z_CALLE],
      [4.16, Z_SOCIAL, X_PAS_O, Z_CALLE],
      [X_PAS_O, Z_PASILLO_FIN, X_COLUMNA_O, Z_CALLE],
    ] as Rect[],
    labelAt: [2.9, 10.9] as [number, number],
    labelScale: 0.9,
  },
  {
    id: "sala-tv",
    name: "Sala de TV",
    kind: "living" as const,
    rects: [
      [X_BANO, Z_SALA, X_DER, Z_PASILLO_FIN],
      [X_COLUMNA_E, Z_PASILLO_FIN, X_DER, Z_RECORTE],
    ] as Rect[],
    color: "#dbc7a6",
    labelAt: [8.3, 10.4] as [number, number],
    labelScale: 0.7,
  },
];

const extWalls: Rect[] = [
  [0, 0, 0.16, Z_FONDO], // colindancia izquierda
  [0.16, 0, X_MURO_DER, 0.16], // fachada de la terraza
  [X_DER, 0.16, X_MURO_DER, 11.87], // colindancia derecha, hasta el recorte
  [X_COLUMNA_O, Z_RECORTE, X_DER, 11.87], // recorte, tramo largo (ventana)
  [X_COLUMNA_O, 11.87, 6.34, Z_CALLE], // recorte, tramo corto (ventana)
  [0.16, Z_CALLE, 0.35, Z_FONDO], // fachada a la calle, tramo corto
  [1.25, Z_CALLE, 6.34, Z_FONDO], // fachada a la calle (hueco de entrada 0.35–1.25)
];

const intWalls: Rect[] = [
  // ---- terraza ----
  [X_LAV, Z_TERRAZA, X_ANTON_E, Z_ANTON_N], // terraza / Antón (corrediza de 2.50 a la derecha)
  [X_ANTON_E, 0.16, X_SUITE, Z_TERRAZA], // terraza / recámara ppal (corrediza de 2.50)
  [0.16, 3.99, X_LAV, 4.09], // extensión de la terraza / lavandería: sin paso
  [X_LAV, Z_TERRAZA, X_ANTON_O, Z_PUERTAS], // terraza y lavandería / Antón

  // ---- suite principal ----
  [X_ANTON_E, Z_ANTON_N, X_SUITE, Z_SERVICIO], // Antón / suite
  [X_BANO, Z_CLOSET_P, X_DER, Z_SUITE], // clóset / baño ppal (el pasillo pasa libre)
  [X_PAS_E, Z_SUITE, X_BANO, 4.95], // pasillo de la suite / baño ppal (puerta 4.95–5.85)
  [X_PAS_E, 5.85, X_BANO, Z_PUERTAS],

  // ---- línea de puertas: Antón y la suite dan al pasillo global, lado a lado ----
  [0.16, Z_PUERTAS, 0.5, Z_SERVICIO], // lavandería / cocina (puerta 0.5–1.3)
  [1.3, Z_PUERTAS, X_COCINA_E, Z_SERVICIO], // Antón / cocina (puerta de Antón en 5.26–6.16)
  [X_PAS_E, Z_PUERTAS, X_DER, Z_SERVICIO], // muro de espejo entre los dos baños

  // ---- cocina, pasillo global y baño de visitas ----
  [X_COCINA_E, Z_SERVICIO, X_PAS_O, Z_COCINA], // cocina / pasillo: muro ciego
  // El último metro de la cocina (de donde acaba la barra a los 5.00) es muro,
  // no barra. El refrigerador va justo en esa esquina.
  [4.16, Z_COCINA, X_PAS_O, Z_SOCIAL],
  [X_PAS_E, Z_SERVICIO, X_BANO, 6.43], // pasillo / baño visitas (puerta 6.43–7.33)
  [X_PAS_E, 7.33, X_BANO, Z_PASILLO_FIN], // sigue como costado de la sala de TV
  [X_BANO, Z_BANO_V, X_DER, Z_SALA], // baño de visitas / sala de TV
  // Entre cocina y comedor NO hay muro: entrada de 0.90 y luego la barra.

  // Columna: parte el pasillo en dos carriles de 0.92 y prolonga la línea que
  // separa el comedor de la sala de TV.
  [X_COLUMNA_O, 7.44, X_COLUMNA_E, 8.78],
];

const thresholds: Rect[] = [
  [X_PAS_O, Z_PUERTAS, X_ANTON_E, Z_SERVICIO], // pasillo global → cuarto Antón (0.90)
  [X_SUITE, Z_PUERTAS, X_PAS_E, Z_SERVICIO], // pasillo global → suite
  [X_PAS_E, 4.95, X_BANO, 5.85], // pasillo de la suite → baño principal (0.90)
  [X_PAS_E, 6.43, X_BANO, 7.33], // pasillo global → baño de visitas (0.90)
  [X_SUITE, Z_CLOSET_P, X_PAS_E, Z_SUITE], // pasillo de la suite → recámara
  [X_ANTON_E, 0.16, X_SUITE, Z_TERRAZA], // recámara → terraza (corrediza)
  [X_ANTON_E - 2.5, Z_TERRAZA, X_ANTON_E, Z_ANTON_N], // Antón → terraza (corrediza de 2.50)
  [0.5, Z_PUERTAS, 1.3, Z_SERVICIO], // lavandería → cocina
  [0.16, Z_COCINA, 1.06, Z_COCINA + 0.1], // comedor → cocina: la entrada de 0.90
  [0.35, Z_CALLE, 1.25, Z_FONDO], // entrada al depto
];

/**
 * Cotas para verificar con cinta. El valor de cada una no se escribe: sale del
 * rectángulo, así que la lista siempre dice lo que el modelo mide de verdad.
 */
const D = 0.12; // grosor de la línea de cota
const dims: Dimension[] = [
  { id: "A", label: "Terraza · fondo", rect: [5.4, 0.16, 5.4 + D, Z_TERRAZA] },
  { id: "B", label: "Terraza · frente", rect: [0.16, 0.6, X_ANTON_E, 0.6 + D] },
  { id: "C", label: "Cuarto Antón · ancho", rect: [X_ANTON_O, 3.1, X_ANTON_E, 3.1 + D] },
  {
    id: "D",
    label: "Cuarto Antón · corrediza a puerta",
    rect: [2.7, Z_ANTON_N, 2.7 + D, Z_PUERTAS],
  },
  { id: "E", label: "Clóset Antón · fondo", rect: [4.8, Z_PUERTAS - 0.3, 4.8 + D, Z_PUERTAS + 0.3] },
  { id: "F", label: "Lavandería · ancho", rect: [0.16, 4.3, X_LAV, 4.3 + D] },
  { id: "G", label: "Lavandería · fondo", rect: [0.45, 4.09, 0.45 + D, Z_PUERTAS] },
  { id: "H", label: "Cocina · ancho", rect: [0.16, 8.2, X_COCINA_E, 8.2 + D] },
  { id: "I", label: "Cocina · fondo", rect: [0.45, Z_SERVICIO, 0.45 + D, Z_COCINA] },
  { id: "J", label: "Pasillo global · ancho", rect: [X_PAS_O, 8.8, X_PAS_E, 8.8 + D] },
  { id: "K", label: "Pasillo global · largo", rect: [6.9, Z_SERVICIO, 6.9 + D, Z_PASILLO_FIN] },
  { id: "L", label: "Recámara ppal · fondo con clóset", rect: [6.7, 0.16, 6.7 + D, Z_CLOSET_P] },
  { id: "M", label: "Recámara ppal · ancho", rect: [X_SUITE, 0.6, X_DER, 0.6 + D] },
  { id: "N", label: "Clóset principal · fondo", rect: [9.8, Z_RECAMARA, 9.8 + D, Z_CLOSET_P] },
  { id: "O", label: "Pasillo suite · recorrido", rect: [6.5, Z_SUITE, 6.5 + D, Z_PUERTAS] },
  { id: "P", label: "Pasillo suite · ancho", rect: [X_SUITE, 5.4, X_PAS_E, 5.4 + D] },
  { id: "Q", label: "Baño principal · ancho", rect: [X_BANO, 4.85, X_DER, 4.85 + D] },
  { id: "R", label: "Baño principal · fondo", rect: [9.95, Z_SUITE, 9.95 + D, Z_PUERTAS] },
  { id: "S", label: "Baño visitas · fondo", rect: [9.95, Z_SERVICIO, 9.95 + D, Z_BANO_V] },
  { id: "T", label: "Comedor · ancho a la calle", rect: [0.16, 12.9, X_COLUMNA_O, 12.9 + D] },
  { id: "U", label: "De entrada cocina a entrada depto", rect: [0.45, Z_COCINA, 0.45 + D, Z_CALLE] },
  { id: "V", label: "Sala TV · ancho a la calle", rect: [X_COLUMNA_E, 11.4, X_DER, 11.4 + D] },
  { id: "W", label: "Sala TV · fondo libre", rect: [9.95, Z_SALA + 0.6, 9.95 + D, Z_RECORTE] },
  { id: "X", label: "Columna · largo", rect: [6.45, 7.44, 6.45 + D, 8.78] },
  { id: "Y", label: "Frente total", rect: [0, -0.7, X_MURO_DER, -0.7 + D] },
  { id: "Z", label: "Fondo total", rect: [-0.7, 0, -0.7 + D, Z_FONDO] },
  // El tramo corto de la esquina de ventana, entre V y T. No se mide: lo despeja
  // la cadena del fondo, porque todo lo demás de esa franja ya está medido.
  { id: "AA", label: "Recorte · ventana corta", rect: [6.02, 11.87, 6.02 + D, Z_CALLE] },
];

/**
 * Los ejes del levantamiento, para que un escenario pueda decir "el muro que va
 * de la columna a la ventana" sin volver a teclear las coordenadas.
 */
export const CDMX_AXES = {
  X_LAV,
  X_ANTON_O,
  X_COCINA_E,
  X_PAS_O,
  X_ANTON_E,
  X_COLUMNA_O,
  X_COLUMNA_E,
  X_SUITE,
  X_PAS_E,
  X_BANO,
  X_DER,
  Z_TERRAZA,
  Z_ANTON_N,
  Z_RECAMARA,
  Z_CLOSET_P,
  Z_SUITE,
  Z_PUERTAS,
  Z_SERVICIO,
  Z_BANO_V,
  Z_SALA,
  Z_COCINA,
  Z_SOCIAL,
  Z_PASILLO_FIN,
  Z_RECORTE,
  Z_CALLE,
} as const;

export const cdmx: Property = {
  id: "cdmx",
  name: "Depto · San Miguel Chapultepec",
  location: "Ciudad de México",
  levels: [
    {
      id: "pb",
      name: "Planta única",
      wallHeight: 2.6,
      rooms,
      extWalls,
      intWalls,
      thresholds,
      dims,
      // Radio = ancho de hoja. Las corredizas de la terraza no abaten.
      doorSwings: [
        { x: X_ANTON_E, z: Z_PUERTAS, r: 0.87, from: 90 }, // pasillo → cuarto Antón
        { x: X_PAS_E, z: Z_PUERTAS, r: 0.87, from: 90 }, // pasillo → suite
        { x: X_BANO, z: 4.95, r: 0.87, from: 270 }, // baño principal
        { x: X_BANO, z: 7.33, r: 0.87, from: 0 }, // baño de visitas (en espejo)
        { x: 1.3, z: Z_SERVICIO, r: 0.75, from: 180 }, // cocina → lavandería
        { x: 1.06, z: Z_COCINA, r: 0.9, from: 90 }, // comedor → cocina
        { x: 1.25, z: Z_CALLE, r: 0.87, from: 90 }, // entrada al depto
      ],
      openings: [
        {
          rect: [X_ANTON_E, 0.16, X_SUITE, Z_TERRAZA],
          type: "door",
          base: 0.9,
          note: "Recámara principal → terraza. Corrediza mixta de 2.50: opaco abajo, vidrio arriba.",
        },
        {
          rect: [X_ANTON_E - 2.5, Z_TERRAZA, X_ANTON_E, Z_ANTON_N],
          type: "door",
          base: 0.9,
          note: "Cuarto Antón → terraza. Corrediza de 2.50, anclada al extremo derecho.",
        },
        {
          rect: [0.16, Z_CALLE, 6.34, Z_FONDO],
          type: "window",
          sill: 1.3,
          note: "Fachada a la calle: corrida de lado a lado, mitad baja ciega.",
        },
        {
          // El recorte es una esquina de ventana: los dos tramos van acristalados
          // igual que la fachada, y se encuentran en la esquina.
          rect: [X_COLUMNA_O, Z_RECORTE, X_DER, 11.87],
          type: "window",
          sill: 1.3,
          note: "Recorte, tramo largo. Misma ventana que la de la calle.",
        },
        {
          rect: [X_COLUMNA_O, 11.87, 6.34, Z_CALLE],
          type: "window",
          sill: 1.3,
          note: "Recorte, tramo corto. Cierra la esquina de ventana.",
        },
      ],
      plinth: [
        [-0.15, -0.15, 10.51, 11.87],
        [-0.15, 11.87, 6.49, 13.47],
      ],
      entry: { x: 0.8, z: 13.7, label: "Entrada" },
      furniture: [
        // ---- recámara principal ----
        {
          type: "wardrobe",
          x: (X_BANO + X_DER) / 2,
          z: (Z_RECAMARA + Z_CLOSET_P) / 2,
          w: X_DER - X_BANO,
          h: 2.4,
          d: 0.6,
          room: "principal",
        },
        { type: "bed", x: 8.28, z: 1.6, w: 1.6, l: 2.0, room: "principal" },
        { type: "nightstand", x: 7.2, z: 0.8, room: "principal" },
        { type: "nightstand", x: 9.4, z: 0.8, room: "principal" },

        // ---- baño principal (2.84 × 1.42) ----
        // Los tres muebles van contra el muro medianero (z = Z_PUERTAS): ahí está
        // la columna de plomería que comparten los dos baños.
        { type: "vanity", x: 8.0, z: 5.85, rot: 180, w: 1.2, d: 0.48, room: "bano-ppal" },
        { type: "toilet", x: 8.95, z: 5.77, rot: 180, room: "bano-ppal" },
        { type: "shower", x: 9.75, z: 5.64, w: 0.9, d: 0.9, room: "bano-ppal" },

        // ---- baño de visitas: el mismo baño, reflejado sobre ese muro ----
        // Mismas x, y las z son 12.28 − z del principal: cada mueble queda
        // exactamente espalda con espalda con su gemelo.
        { type: "vanity", x: 8.0, z: 6.43, w: 1.2, d: 0.48, room: "bano-visitas" },
        { type: "toilet", x: 8.95, z: 6.51, room: "bano-visitas" },
        { type: "shower", x: 9.75, z: 6.64, w: 0.9, d: 0.9, rot: 180, room: "bano-visitas" },

        // ---- cuarto Antón: el clóset monta sobre el muro de la cocina ----
        {
          type: "wardrobe",
          x: (X_ANTON_O + X_COCINA_E) / 2,
          z: Z_PUERTAS,
          w: X_COCINA_E - X_ANTON_O,
          h: 2.4,
          d: 0.6,
          room: "anton",
        },
        { type: "bed", x: 3.7, z: 3.9, rot: 90, w: 1.4, l: 2.0, pillows: 1, cover: "#7d8ea0", room: "anton" },
        { type: "desk", x: 5.8, z: 3.7, rot: 90, l: 1.3, d: 0.55, room: "anton" },
        { type: "monitor", x: 5.95, z: 3.7, rot: 90, y: 0.74, room: "anton" },
        { type: "djBooth", x: 4.7, z: 5.2, room: "anton" },
        { type: "rug", x: 3.0, z: 5.2, w: 1.0, d: 1.0, round: true, c: "#cbb9a0", room: "anton" },

        // ---- lavandería ----
        { type: "washerStack", x: 1.85, z: 4.65, rot: 90, room: "lavanderia" },
        { type: "utilitySink", x: 1.9, z: 5.65, room: "lavanderia" },

        // ---- cocina: entrada 0.90 + barra 3.10 + refrigerador 1.00 = 5.00 ----
        { type: "counter", x: 2.9, z: 6.47, l: 4.3, d: 0.55, room: "cocina" },
        { type: "cooktop", x: 3.4, z: 6.46, room: "cocina" },
        { type: "sinkTop", x: 1.5, z: 6.46, room: "cocina" },
        { type: "bar", x: 2.61, z: Z_COCINA, l: 3.1, d: 0.65, room: "cocina" },
        { type: "fridge", x: 4.66, z: 8.03, w: 0.85, rot: 180, room: "cocina" },

        // ---- comedor ----
        { type: "diningSet", x: 2.9, z: 10.6, r: 0.75, seats: 4, ring: 1.15, room: "comedor" },
        { type: "sideboard", x: 2.9, z: 12.8, room: "comedor" },
        { type: "plant", x: 5.5, z: 12.5, s: 1.0, room: "comedor" },

        // ---- sala de TV: el mueble de obra va contra el baño de visitas ----
        {
          type: "mediaWall",
          x: (X_BANO + X_DER) / 2,
          z: Z_SALA + 0.3,
          w: 2.5,
          d: 0.6,
          rot: 180,
          room: "sala-tv",
        },
        { type: "rug", x: 8.3, z: 10.2, w: 2.6, d: 2.0, c: "#d6c3a8", room: "sala-tv" },
        { type: "coffeeTable", x: 8.3, z: 10.0, room: "sala-tv" },
        { type: "sofa", x: 8.3, z: 11.0, w: 2.2, d: 0.95, room: "sala-tv" },

        // ---- pasillo: el tapete va por el carril oeste, libre de la columna ----
        { type: "rug", x: 5.72, z: 7.6, w: 0.8, d: 2.2, c: "#bfa287", room: "pasillo" },

        // ---- terraza ----
        { type: "roundTable", x: 3.9, z: 1.6, r: 0.42, h: 0.64, room: "terraza" },
        { type: "stool", x: 3.15, z: 1.6, room: "terraza" },
        { type: "stool", x: 4.65, z: 1.6, room: "terraza" },
        { type: "lounger", x: 2.35, z: 1.15, room: "terraza" },
        { type: "plant", x: 0.55, z: 0.55, s: 1.15, room: "terraza" },
        { type: "plant", x: 1.35, z: 0.45, s: 0.85, room: "terraza" },
        { type: "plant", x: 5.8, z: 0.55, s: 0.95, room: "terraza" },
        { type: "plant", x: 0.6, z: 2.2, s: 0.9, room: "terraza" },
        { type: "plant", x: 0.95, z: 3.5, s: 1.0, room: "terraza" },
        { type: "plant", x: 1.85, z: 3.4, s: 0.75, room: "terraza" },
      ],
    },
  ],
};
