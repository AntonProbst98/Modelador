import { useCallback, useEffect, useMemo, useState } from "react";

import { NEW_PIECE_DEFAULTS, type FurnitureType } from "../model/catalog";
import { levelBBox } from "../model/geometry";
import type { Furniture, Level } from "../model/types";
import { snapPosition } from "./snap";

const storeKey = (propertyId: string, levelId: string) =>
  `modelador:edit:${propertyId}:${levelId}`;

function load(key: string): Furniture[] | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Furniture[]) : null;
  } catch {
    return null;
  }
}

/**
 * Estado editable del mobiliario de un nivel.
 *
 * El archivo de la propiedad sigue siendo la fuente de verdad: lo que se edita
 * aquí vive en localStorage como una capa encima, y se baja al archivo copiando
 * el bloque que produce `serializeFurniture`. Por eso siempre hay "Restaurar":
 * vuelve a lo que dice el archivo y borra la capa.
 */
export function useFurnitureEditor(propertyId: string, level: Level) {
  const key = storeKey(propertyId, level.id);
  const [custom, setCustom] = useState<Furniture[] | null>(() => load(key));
  const [selected, setSelected] = useState<number | null>(null);

  // Al cambiar de propiedad o nivel se recarga la capa de ese nivel.
  useEffect(() => {
    setCustom(load(key));
    setSelected(null);
  }, [key]);

  const items = custom ?? level.furniture;

  const commit = useCallback(
    (next: Furniture[]) => {
      setCustom(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // almacenamiento lleno o bloqueado: la edición sigue viva en memoria.
      }
    },
    [key],
  );

  const walls = useMemo(() => [...level.extWalls, ...level.intWalls], [level]);

  const move = useCallback(
    (index: number, x: number, z: number, snap: boolean) => {
      const piece = items[index];
      if (!piece) return;
      const pos = snapPosition(piece, x, z, {
        grid: 0.05,
        tolerance: snap ? 0.25 : 0,
        walls,
      });
      commit(items.map((p, i) => (i === index ? { ...p, ...pos } : p)));
    },
    [items, walls, commit],
  );

  const rotate = useCallback(
    (index: number, delta: number) => {
      commit(
        items.map((p, i) =>
          i === index ? { ...p, rot: (((p.rot ?? 0) + delta) % 360 + 360) % 360 } : p,
        ),
      );
    },
    [items, commit],
  );

  const remove = useCallback(
    (index: number) => {
      commit(items.filter((_, i) => i !== index));
      setSelected(null);
    },
    [items, commit],
  );

  const duplicate = useCallback(
    (index: number) => {
      const piece = items[index];
      if (!piece) return;
      const copy = { ...piece, x: piece.x + 0.3, z: piece.z + 0.3 };
      commit([...items, copy]);
      setSelected(items.length);
    },
    [items, commit],
  );

  const add = useCallback(
    (type: FurnitureType, room?: string) => {
      const box = levelBBox(level);
      const piece = {
        type,
        x: Math.round(((box.x1 + box.x2) / 2) * 20) / 20,
        z: Math.round(((box.z1 + box.z2) / 2) * 20) / 20,
        ...(room ? { room } : {}),
        ...NEW_PIECE_DEFAULTS[type],
      } as Furniture;
      commit([...items, piece]);
      setSelected(items.length);
    },
    [items, level, commit],
  );

  const reset = useCallback(() => {
    setCustom(null);
    setSelected(null);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignorado a propósito
    }
  }, [key]);

  return {
    items,
    /** true cuando hay una capa encima del archivo. */
    edited: custom !== null,
    selected,
    setSelected,
    move,
    rotate,
    remove,
    duplicate,
    add,
    reset,
  };
}

export type FurnitureEditor = ReturnType<typeof useFurnitureEditor>;
