import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { levelFloorY, plinthRects } from "../model/geometry";
import { PAL, ROOM_COLORS } from "../model/palette";
import { LEVEL_DEFAULTS, type Level, type Rect, type Room } from "../model/types";
import { getArcMaterial, getHighlightMaterial, getMaterial } from "./materials";

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Losa horizontal definida por su rectángulo en planta y la cota de su cara superior. */
function Slab({
  rect,
  top,
  thickness,
  material,
}: {
  rect: Rect;
  top: number;
  thickness: number;
  material: THREE.Material;
}) {
  const [x1, z1, x2, z2] = rect;
  return (
    <mesh
      position={[(x1 + x2) / 2, top - thickness / 2, (z1 + z2) / 2]}
      material={material}
      receiveShadow
    >
      <boxGeometry args={[Math.abs(x2 - x1), thickness, Math.abs(z2 - z1)]} />
    </mesh>
  );
}

/**
 * Muros. Todo el grupo se escala en Y desde el nivel de piso, así que subir o
 * bajar los muros es animar un solo nodo en vez de cientos de mallas.
 */
function Walls({ rects, floorY, height }: { rects: Rect[]; floorY: number; height: number }) {
  const group = useRef<THREE.Group>(null);
  const current = useRef(height);
  const material = getMaterial(PAL.wall, 1, 0.95);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    // Igual que la cámara: suavizado por tiempo para que no dependa del frame rate.
    current.current += (height - current.current) * (1 - Math.exp(-8 * Math.min(delta, 0.1)));
    g.scale.y = Math.max(current.current, 0.0001);
    g.visible = current.current > 0.02;
  });

  return (
    <group ref={group} position={[0, floorY - 0.03, 0]}>
      {rects.map(([x1, z1, x2, z2], i) => (
        <mesh
          key={i}
          position={[(x1 + x2) / 2, 0.5, (z1 + z2) / 2]}
          material={material}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[Math.max(x2 - x1, 0.02), 1, Math.max(z2 - z1, 0.02)]} />
        </mesh>
      ))}
    </group>
  );
}

function DoorSwings({ swings, floorY }: { swings: Level["doorSwings"]; floorY: number }) {
  const material = getArcMaterial(PAL.doorArc);
  return (
    <>
      {swings.map((s, i) => (
        <mesh
          key={i}
          position={[s.x, floorY + 0.02, s.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={material}
        >
          <ringGeometry args={[s.r - 0.035, s.r, 26, 1, rad(s.from), Math.PI / 2]} />
        </mesh>
      ))}
    </>
  );
}

function RoomFloor({
  room,
  floorY,
  thickness,
  selected,
  onSelect,
}: {
  room: Room;
  floorY: number;
  thickness: number;
  selected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const material = getMaterial(room.color ?? ROOM_COLORS[room.kind]);
  const highlight = getHighlightMaterial("#4a5d47");

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(selected ? null : room.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      {room.rects.map((rect, i) => (
        <Slab key={i} rect={rect} top={floorY} thickness={thickness} material={material} />
      ))}
      {selected &&
        room.rects.map((rect, i) => (
          <Slab key={`hl-${i}`} rect={rect} top={floorY + 0.006} thickness={0.01} material={highlight} />
        ))}
    </group>
  );
}

export function Structure({
  level,
  wallHeight,
  selectedRoom,
  onSelectRoom,
}: {
  level: Level;
  wallHeight: number;
  selectedRoom: string | null;
  onSelectRoom: (id: string | null) => void;
}) {
  const floorY = levelFloorY(level);
  const thickness = level.floorThickness ?? LEVEL_DEFAULTS.floorThickness;
  const base = level.elevation ?? LEVEL_DEFAULTS.elevation;

  return (
    <group>
      {plinthRects(level).map((rect, i) => (
        <Slab
          key={`plinth-${i}`}
          rect={rect}
          top={base}
          thickness={0.12}
          material={getMaterial(PAL.plinth)}
        />
      ))}

      {level.rooms.map((room) => (
        <RoomFloor
          key={room.id}
          room={room}
          floorY={floorY}
          thickness={thickness}
          selected={selectedRoom === room.id}
          onSelect={onSelectRoom}
        />
      ))}

      {level.thresholds.map((rect, i) => (
        <Slab
          key={`th-${i}`}
          rect={rect}
          top={floorY - 0.01}
          thickness={0.07}
          material={getMaterial(PAL.threshold)}
        />
      ))}

      <Walls rects={[...level.extWalls, ...level.intWalls]} floorY={floorY} height={wallHeight} />
      <DoorSwings swings={level.doorSwings} floorY={floorY} />
    </group>
  );
}
