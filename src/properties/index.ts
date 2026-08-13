import type { Property } from "../model/types";
import { cdmx } from "./cdmx";
import { remodelMJ } from "./cdmx-mj";
import { tepoztlan } from "./tepoztlan";

/** Registro de propiedades. Agregar una casa = agregar un archivo y una línea aquí. */
// Los escenarios se enganchan aquí y no dentro del archivo de la propiedad:
// así el escenario puede importar los ejes del base sin ciclo de imports.
export const PROPERTIES: Property[] = [{ ...cdmx, scenarios: [remodelMJ] }, tepoztlan];

export const getProperty = (id: string): Property =>
  PROPERTIES.find((p) => p.id === id) ?? PROPERTIES[0];
