import { useEffect, useState } from "react";

/**
 * Estado que sobrevive al reload. Hoy guarda preferencias de vista; cuando el
 * modelador tenga edición, el modelo editado se persiste con este mismo patrón.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(`modelador:${key}`);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`modelador:${key}`, JSON.stringify(value));
    } catch {
      // almacenamiento lleno o bloqueado: la app sigue, sólo no recuerda.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
