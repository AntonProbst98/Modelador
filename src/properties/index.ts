import type { Property } from "../model/types";
import { cdmx } from "./cdmx";
import { tepoztlan } from "./tepoztlan";

/** Registro de propiedades. Agregar una casa = agregar un archivo y una línea aquí. */
export const PROPERTIES: Property[] = [cdmx, tepoztlan];

export const getProperty = (id: string): Property =>
  PROPERTIES.find((p) => p.id === id) ?? PROPERTIES[0];
