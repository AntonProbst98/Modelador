import { Html } from "@react-three/drei";

import { fmtArea, levelFloorY, roomAnchor, roomArea } from "../model/geometry";
import type { Level } from "../model/types";

/**
 * Etiquetas en DOM (drei/Html) en vez de sprites de canvas: se leen nítidas en
 * cualquier zoom, se estilan con CSS y son clickeables para seleccionar cuarto.
 */
export function Labels({
  level,
  visible,
  selectedRoom,
  onSelectRoom,
}: {
  level: Level;
  visible: boolean;
  selectedRoom: string | null;
  onSelectRoom: (id: string | null) => void;
}) {
  const floorY = levelFloorY(level);
  if (!visible) return null;

  return (
    <group>
      {level.rooms.map((room) => {
        const [x, z] = roomAnchor(room);
        const active = selectedRoom === room.id;
        return (
          <Html
            key={room.id}
            position={[x, floorY + 1.45, z]}
            center
            distanceFactor={11}
            zIndexRange={[20, 0]}
          >
            <button
              className={`room-tag${active ? " is-active" : ""}`}
              style={{ fontSize: `${13 * (room.labelScale ?? 0.8)}px` }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectRoom(active ? null : room.id);
              }}
            >
              {room.name}
              <span className="room-tag__area">{fmtArea(roomArea(room))}</span>
            </button>
          </Html>
        );
      })}

      {level.entry?.label && (
        <Html
          position={[level.entry.x, floorY + 0.55, level.entry.z + 0.45]}
          center
          distanceFactor={11}
          zIndexRange={[20, 0]}
        >
          <div className="room-tag room-tag--plain" style={{ fontSize: "11px" }}>
            {level.entry.label}
          </div>
        </Html>
      )}
    </group>
  );
}
