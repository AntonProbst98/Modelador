import { buildParts } from "../model/catalog";
import { levelFloorY } from "../model/geometry";
import type { Part } from "../model/parts";
import type { Furniture, Level } from "../model/types";
import { getMaterial } from "./materials";

const rad = (deg: number) => (deg * Math.PI) / 180;

function PartMesh({ part }: { part: Part }) {
  if (part.k === "sphere") {
    return (
      <mesh position={[part.x, part.y, part.z]} material={getMaterial(part.c)} castShadow receiveShadow>
        <sphereGeometry args={[part.r, 18, 14]} />
      </mesh>
    );
  }

  if (part.k === "cyl") {
    const [rx, ry, rz] = part.rot ?? [0, 0, 0];
    return (
      <mesh
        position={[part.x, part.y, part.z]}
        rotation={[rad(rx), rad(ry), rad(rz)]}
        material={getMaterial(part.c, part.opacity ?? 1)}
        castShadow={part.cast !== false}
        receiveShadow
      >
        <cylinderGeometry args={[part.r, part.rb ?? part.r, part.h, part.seg ?? 28]} />
      </mesh>
    );
  }

  return (
    <mesh
      position={[part.x, part.y, part.z]}
      rotation={[0, rad(part.ry ?? 0), 0]}
      material={getMaterial(part.c, part.opacity ?? 1, part.opacity && part.opacity < 1 ? 0.15 : 0.9)}
      castShadow={part.cast !== false}
      receiveShadow
    >
      <boxGeometry args={[part.w, part.h, part.d]} />
    </mesh>
  );
}

/**
 * Una pieza colocada: el catálogo entrega primitivas en coordenadas locales y
 * este grupo las lleva a su sitio. Así el mueble no sabe dónde está la casa.
 */
function Piece({ piece, floorY }: { piece: Furniture; floorY: number }) {
  const { type, x, z, rot = 0, y = 0, room: _room, ...props } = piece;
  const parts = buildParts(type, props as never);

  return (
    <group position={[x, floorY + y, z]} rotation={[0, rad(rot), 0]}>
      {parts.map((part, i) => (
        <PartMesh key={i} part={part} />
      ))}
    </group>
  );
}

export function FurnitureLayer({ level, visible }: { level: Level; visible: boolean }) {
  const floorY = levelFloorY(level);
  if (!visible) return null;
  return (
    <group>
      {level.furniture.map((piece, i) => (
        <Piece key={`${piece.type}-${i}`} piece={piece} floorY={floorY} />
      ))}
    </group>
  );
}
