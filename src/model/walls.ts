/**
 * Recorte de muros.
 *
 * Un muro se autora como un rectángulo macizo. Aquí se parte en los pedazos que
 * de verdad hay que dibujar cuando lo cruza una ventana o una cancelería:
 * antepecho, panel opaco, vidrio y dintel, más los tramos ciegos a los lados.
 *
 * Como todo es ortogonal, basta con trabajar sobre el eje largo del muro: el eje
 * corto es su espesor y se hereda tal cual, así que al dibujar un hueco no hace
 * falta acertarle al grosor — con que el rectángulo pise el muro, basta.
 */

import { LEVEL_DEFAULTS, type Level, type Opening, type Rect } from "./types";

export interface WallPiece {
  /** Huella en planta, ya recortada al tramo y al espesor del muro. */
  rect: Rect;
  /** Cota inferior y superior, desde el piso terminado. */
  bottom: number;
  top: number;
  glass: boolean;
}

const EPS = 1e-6;

/** Índices [inicio, fin] del eje largo del rectángulo y los del eje corto. */
function axes(r: Rect): { long: [number, number]; cross: [number, number] } {
  return r[2] - r[0] >= r[3] - r[1]
    ? { long: [0, 2], cross: [1, 3] }
    : { long: [1, 3], cross: [0, 2] };
}

export function buildWallPieces(level: Level): WallPiece[] {
  const wallTop = level.wallHeight ?? LEVEL_DEFAULTS.wallHeight;
  const openings = level.openings ?? [];
  const pieces: WallPiece[] = [];

  for (const wall of [...level.extWalls, ...level.intWalls]) {
    const { long, cross } = axes(wall);
    const [i1, i2] = long;
    const [j1, j2] = cross;
    const start = wall[i1];
    const end = wall[i2];

    const emit = (s: number, e: number, bottom: number, top: number, glass = false) => {
      if (e - s < EPS || top - bottom < EPS) return;
      const rect = [...wall] as Rect;
      rect[i1] = s;
      rect[i2] = e;
      pieces.push({ rect, bottom, top, glass });
    };

    // Huecos que de verdad pisan este muro: tienen que traslaparlo en ambos ejes.
    const hits = openings
      .map((o: Opening) => ({
        s: Math.max(start, o.rect[i1]),
        e: Math.min(end, o.rect[i2]),
        thickness: Math.min(wall[j2], o.rect[j2]) - Math.max(wall[j1], o.rect[j1]),
        sill: o.sill ?? 0,
        head: Math.min(o.head ?? wallTop, wallTop),
        base: o.base ?? 0,
      }))
      .filter((h) => h.e - h.s > EPS && h.thickness > EPS)
      .sort((a, b) => a.s - b.s);

    let cursor = start;
    for (const h of hits) {
      // Un hueco que quedó detrás del cursor ya lo cubrió otro: se ignora.
      if (h.e <= cursor + EPS) continue;
      const s = Math.max(h.s, cursor);
      emit(cursor, s, 0, wallTop);

      const glassBottom = Math.min(h.sill + h.base, h.head);
      emit(s, h.e, 0, h.sill); // antepecho de obra
      emit(s, h.e, h.sill, glassBottom); // panel opaco de la cancelería
      emit(s, h.e, glassBottom, h.head, true); // vidrio
      emit(s, h.e, h.head, wallTop); // dintel
      cursor = h.e;
    }
    emit(cursor, end, 0, wallTop);
  }

  return pieces;
}
