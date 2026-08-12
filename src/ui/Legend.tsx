import { fmtArea, roomArea } from "../model/geometry";
import { ROOM_COLORS } from "../model/palette";
import type { Level } from "../model/types";

export function Legend({
  level,
  selectedRoom,
  onSelectRoom,
}: {
  level: Level;
  selectedRoom: string | null;
  onSelectRoom: (id: string | null) => void;
}) {
  const rooms = [...level.rooms].sort((a, b) => roomArea(b) - roomArea(a));

  return (
    <div className="legend">
      {rooms.map((room) => {
        const active = selectedRoom === room.id;
        return (
          <button
            key={room.id}
            className={`legend__item${active ? " is-active" : ""}`}
            onClick={() => onSelectRoom(active ? null : room.id)}
          >
            <span className="swatch" style={{ background: room.color ?? ROOM_COLORS[room.kind] }} />
            <span className="legend__name">{room.name}</span>
            <span className="legend__area">{fmtArea(roomArea(room))}</span>
          </button>
        );
      })}
    </div>
  );
}
