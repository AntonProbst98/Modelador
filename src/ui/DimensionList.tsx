import { dimLength, fmt } from "../model/geometry";
import type { Level } from "../model/types";

/**
 * La lista para salir a medir: letra, qué es y cuánto mide HOY el modelo.
 * Basta con recorrerla con la cinta y reportar las que no coincidan.
 */
export function DimensionList({
  level,
  selected,
  onSelect,
}: {
  level: Level;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const dims = level.dims ?? [];
  if (dims.length === 0) return null;

  return (
    <aside className="dims">
      <div className="dims__head">
        <span className="dims__title">Cotas</span>
        <span className="dims__hint">medidas del modelo · verifica con cinta</span>
      </div>
      <ol className="dims__list">
        {dims.map((dim) => (
          <li key={dim.id}>
            <button
              className={`dims__row${selected === dim.id ? " is-active" : ""}`}
              onClick={() => onSelect(selected === dim.id ? null : dim.id)}
            >
              <span className="dims__id">{dim.id}</span>
              <span className="dims__label">{dim.label}</span>
              <span className="dims__value">{fmt(dimLength(dim.rect))} m</span>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  );
}
