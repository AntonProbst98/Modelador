import { useState } from "react";

import type { FurnitureEditor } from "../editor/useFurnitureEditor";
import { serializeFurniture } from "../editor/serialize";
import { TYPE_LABELS, type FurnitureType } from "../model/catalog";
import { fmt } from "../model/geometry";
import type { Level } from "../model/types";

const TYPES = (Object.keys(TYPE_LABELS) as FurnitureType[]).sort((a, b) =>
  TYPE_LABELS[a].localeCompare(TYPE_LABELS[b], "es"),
);

export function EditorPanel({ level, editor }: { level: Level; editor: FurnitureEditor }) {
  const [adding, setAdding] = useState<FurnitureType>("stool");
  const [code, setCode] = useState<string | null>(null);
  const piece = editor.selected != null ? editor.items[editor.selected] : null;

  return (
    <aside className="editor">
      <div className="editor__head">
        <span className="editor__title">Editar mobiliario</span>
        <span className="editor__hint">
          {editor.edited ? "con cambios sin bajar al archivo" : "igual que el archivo"}
        </span>
      </div>

      <div className="editor__body">
        {piece ? (
          <>
            <div className="editor__row">
              <span className="editor__label">{TYPE_LABELS[piece.type]}</span>
              <span className="editor__coords">
                {fmt(piece.x)} · {fmt(piece.z)} · {piece.rot ?? 0}°
              </span>
            </div>
            <div className="editor__buttons">
              <button onClick={() => editor.rotate(editor.selected!, -90)}>↺ 90°</button>
              <button onClick={() => editor.rotate(editor.selected!, -15)}>↺ 15°</button>
              <button onClick={() => editor.rotate(editor.selected!, 15)}>15° ↻</button>
              <button onClick={() => editor.rotate(editor.selected!, 90)}>90° ↻</button>
            </div>
            <div className="editor__buttons">
              <button onClick={() => editor.duplicate(editor.selected!)}>Duplicar</button>
              <button className="is-danger" onClick={() => editor.remove(editor.selected!)}>
                Eliminar
              </button>
            </div>
            <p className="editor__note">
              Arrastra para mover. Se pega solo a los muros; con Shift, libre.
            </p>
          </>
        ) : (
          <p className="editor__note">
            Click en un mueble para seleccionarlo. Arrastra para moverlo; R y Shift+R lo giran,
            Supr lo borra.
          </p>
        )}

        <div className="editor__add">
          <select value={adding} onChange={(e) => setAdding(e.target.value as FurnitureType)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <button onClick={() => editor.add(adding, piece?.room)}>Agregar</button>
        </div>
      </div>

      <div className="editor__foot">
        <button onClick={() => setCode(serializeFurniture(editor.items))}>
          Exportar al archivo
        </button>
        <button className="is-danger" disabled={!editor.edited} onClick={editor.reset}>
          Restaurar
        </button>
      </div>

      {code !== null && (
        <div className="editor__export">
          <div className="editor__exportHead">
            <span>
              Pega esto en <code>furniture</code> de {level.id}
            </span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(code);
              }}
            >
              Copiar
            </button>
            <button onClick={() => setCode(null)}>Cerrar</button>
          </div>
          <textarea readOnly value={code} spellCheck={false} />
        </div>
      )}
    </aside>
  );
}
