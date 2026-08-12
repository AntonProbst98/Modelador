import { fmt, fmtArea, isInterior, rectsBBox, roomArea, roomNote } from "../model/geometry";
import { ROOM_KIND_LABEL } from "../model/palette";
import type { Level } from "../model/types";

/** Ficha del cuarto seleccionado. Todas las cifras salen del modelo, ninguna está escrita a mano. */
export function RoomPanel({
  level,
  roomId,
  onClose,
}: {
  level: Level;
  roomId: string;
  onClose: () => void;
}) {
  const room = level.rooms.find((r) => r.id === roomId);
  if (!room) return null;

  const box = rectsBBox(room.rects);
  const pieces = level.furniture.filter((f) => f.room === room.id);
  const area = roomArea(room);
  const irregular = room.rects.length > 1;

  return (
    <aside className="panel">
      <div className="panel__head">
        <div>
          <div className="panel__title">{room.name}</div>
          <div className="panel__sub">
            {ROOM_KIND_LABEL[room.kind]}
            {!isInterior(room) && " · no cuenta en área interior"}
          </div>
        </div>
        <button className="panel__close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
      </div>

      <dl className="panel__stats">
        <div>
          <dt>Área</dt>
          <dd>{fmtArea(area)}</dd>
        </div>
        <div>
          <dt>{irregular ? "Tramo mayor" : "Medidas"}</dt>
          <dd>{roomNote(room)}</dd>
        </div>
        {/* En un cuarto rectangular la envolvente sería la misma cifra de arriba. */}
        {irregular && (
          <div>
            <dt>Envolvente</dt>
            <dd>
              {fmt(box.x2 - box.x1)} × {fmt(box.z2 - box.z1)} m
            </dd>
          </div>
        )}
        <div>
          <dt>Muebles</dt>
          <dd>{pieces.length}</dd>
        </div>
      </dl>

      {irregular && (
        <div className="panel__note">
          Cuarto irregular: {room.rects.length} tramos que suman {fmtArea(area)}.
        </div>
      )}
    </aside>
  );
}
