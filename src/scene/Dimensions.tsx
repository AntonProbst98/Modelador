import { Html } from "@react-three/drei";

import { dimMid, levelFloorY } from "../model/geometry";
import type { Level } from "../model/types";
import { getHighlightMaterial } from "./materials";

/**
 * Cotas con letra. Sirven para una cosa muy concreta: salir con la cinta,
 * ir cuarto por cuarto y cantar "la C no son 3.60, son 3.44".
 */
export function Dimensions({
  level,
  visible,
  selected,
  onSelect,
}: {
  level: Level;
  visible: boolean;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const floorY = levelFloorY(level);
  const dims = level.dims ?? [];
  if (!visible || dims.length === 0) return null;

  const line = getHighlightMaterial("#b4523f");
  const lineOn = getHighlightMaterial("#7d3323");

  return (
    <group>
      {dims.map((dim) => {
        const [x1, z1, x2, z2] = dim.rect;
        const [mx, mz] = dimMid(dim.rect);
        const active = selected === dim.id;
        return (
          <group key={dim.id}>
            <mesh
              position={[(x1 + x2) / 2, floorY + 0.03, (z1 + z2) / 2]}
              material={active ? lineOn : line}
            >
              <boxGeometry args={[x2 - x1, 0.02, z2 - z1]} />
            </mesh>
            <Html position={[mx, floorY + 0.35, mz]} center distanceFactor={11} zIndexRange={[30, 0]}>
              <button
                className={`dim-tag${active ? " is-active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(active ? null : dim.id);
                }}
              >
                {dim.id}
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
