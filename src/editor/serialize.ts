import type { Furniture } from "../model/types";

const num = (n: number) => String(Math.round(n * 1000) / 1000);

const value = (v: unknown) =>
  typeof v === "number" ? num(v) : typeof v === "string" ? JSON.stringify(v) : String(v);

/**
 * Devuelve el bloque `furniture` listo para pegar en el archivo de la propiedad,
 * con el mismo orden de claves y la misma sangría que el resto del proyecto.
 * El editor es una comodidad; la fuente de verdad sigue siendo el archivo.
 */
export function serializeFurniture(items: Furniture[]): string {
  return items
    .map((piece) => {
      const { type, x, z, rot, y, room, ...rest } = piece as Furniture & {
        [k: string]: unknown;
      };
      const fields = [`type: ${JSON.stringify(type)}`, `x: ${num(x)}`, `z: ${num(z)}`];
      if (rot) fields.push(`rot: ${num(rot)}`);
      if (y) fields.push(`y: ${num(y)}`);
      for (const [key, v] of Object.entries(rest)) {
        if (v !== undefined) fields.push(`${key}: ${value(v)}`);
      }
      if (room) fields.push(`room: ${JSON.stringify(room)}`);
      return `        { ${fields.join(", ")} },`;
    })
    .join("\n");
}
