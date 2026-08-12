import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { levelFloorY, plinthRects } from "../model/geometry";
import { PAL, ROOM_COLORS } from "../model/palette";
import { LEVEL_DEFAULTS, type Level, type Rect, type Room } from "../model/types";
import { buildWallPieces, type WallPiece } from "../model/walls";
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
 * Muros, ya partidos en pedazos por `buildWallPieces`.
 *
 * "Muros bajos" no encoge la casa: corta la sección a una altura. Cada pedazo se
 * dibuja hasta donde llega el corte y desaparece si queda por encima, que es
 * como se lee un plano y además deja ver dónde arranca cada ventana.
 */
function Walls({ pieces, floorY, cut }: { pieces: WallPiece[]; floorY: number; cut: number }) {
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const current = useRef(cut);
  meshes.current.length = pieces.length;

  const wallMat = getMaterial(PAL.wall, 1, 0.95);
  const glassMat = getMaterial(PAL.glass, 0.34, 0.12);

  useFrame((_, delta) => {
    current.current += (cut - current.current) * (1 - Math.exp(-8 * Math.min(delta, 0.1)));
    const c = current.current;
    for (let i = 0; i < pieces.length; i++) {
      const mesh = meshes.current[i];
      const piece = pieces[i];
      if (!mesh || !piece) continue;
      const height = Math.min(piece.top, c) - piece.bottom;
      mesh.visible = height > 0.005;
      if (!mesh.visible) continue;
      mesh.scale.y = height;
      mesh.position.y = floorY - 0.03 + piece.bottom + height / 2;
    }
  });

  return (
    <group>
      {pieces.map((piece, i) => {
        const [x1, z1, x2, z2] = piece.rect;
        return (
          <mesh
            key={i}
            ref={(el) => {
              meshes.current[i] = el;
            }}
            position={[(x1 + x2) / 2, floorY, (z1 + z2) / 2]}
            material={piece.glass ? glassMat : wallMat}
            castShadow={!piece.glass}
            receiveShadow
          >
            <boxGeometry args={[Math.max(x2 - x1, 0.02), 1, Math.max(z2 - z1, 0.02)]} />
          </mesh>
        );
      })}
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
  const pieces = useMemo(() => buildWallPieces(level), [level]);

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

      <Walls pieces={pieces} floorY={floorY} cut={wallHeight} />
      <DoorSwings swings={level.doorSwings} floorY={floorY} />
    </group>
  );
}
