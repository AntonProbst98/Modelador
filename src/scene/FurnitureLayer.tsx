import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { localFootprint } from "../editor/snap";
import { buildParts } from "../model/catalog";
import { levelFloorY } from "../model/geometry";
import type { Part } from "../model/parts";
import type { Furniture, Level } from "../model/types";
import { getHighlightMaterial, getMaterial } from "./materials";
import { roundedBox } from "./roundedBox";

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Callbacks del editor. Si no vienen, la capa es sólo de lectura. */
export interface FurnitureEdit {
  selected: number | null;
  onSelect: (index: number | null) => void;
  onMove: (index: number, x: number, z: number, snap: boolean) => void;
  /** Avisa cuando empieza y acaba un arrastre, para poder frenar el orbit. */
  onDragChange: (dragging: boolean) => void;
}

/**
 * Recorta una pieza al plano de corte, en coordenadas locales del mueble.
 * Devuelve null si queda entera por encima. Como las piezas sólo giran sobre Y,
 * el eje vertical se conserva y basta con ajustar altura y centro.
 */
function clipPart(part: Part, cut: number): Part | null {
  if (part.k === "sphere") return part.y - part.r < cut ? part : null;
  const bottom = part.y - part.h / 2;
  if (bottom >= cut) return null;
  const top = part.y + part.h / 2;
  if (top <= cut) return part;
  const h = cut - bottom;
  return { ...part, h, y: bottom + h / 2 };
}

function PartMesh({ part }: { part: Part }) {
  if (part.k === "sphere") {
    return (
      <mesh position={[part.x, part.y, part.z]} material={getMaterial(part.c, { finish: part.finish })} castShadow receiveShadow>
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
        material={getMaterial(part.c, { opacity: part.opacity ?? 1, finish: part.finish })}
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
      geometry={roundedBox(part.w, part.h, part.d)}
      material={getMaterial(part.c, { opacity: part.opacity ?? 1, finish: part.finish })}
      castShadow={part.cast !== false}
      receiveShadow
    />
  );
}

/**
 * Una pieza colocada: el catálogo entrega primitivas en coordenadas locales y
 * este grupo las lleva a su sitio. Así el mueble no sabe dónde está la casa.
 */
function Piece({
  piece,
  index,
  floorY,
  cut,
  edit,
  onGrab,
}: {
  piece: Furniture;
  index: number;
  floorY: number;
  cut: number;
  edit?: FurnitureEdit;
  onGrab: (index: number) => void;
}) {
  const { type, x, z, rot = 0, y = 0, room: _room, ...props } = piece;
  const parts = buildParts(type, props as never)
    .map((part) => clipPart(part, cut - y))
    .filter((part): part is Part => part !== null);

  const selected = edit?.selected === index;
  const foot = useMemo(() => localFootprint(piece), [piece]);

  return (
    <group
      position={[x, floorY + y, z]}
      rotation={[0, rad(rot), 0]}
      onPointerDown={
        edit
          ? (e) => {
              e.stopPropagation();
              onGrab(index);
            }
          : undefined
      }
      onPointerOver={
        edit
          ? (e) => {
              e.stopPropagation();
              document.body.style.cursor = "move";
            }
          : undefined
      }
      onPointerOut={edit ? () => (document.body.style.cursor = "") : undefined}
    >
      {parts.map((part, i) => (
        <PartMesh key={i} part={part} />
      ))}

      {selected && (
        <group position={[0, -y, 0]}>
          <mesh position={[0, 0.014, 0]} material={getHighlightMaterial("#b4523f")}>
            <boxGeometry args={[foot.w + 0.08, 0.012, foot.d + 0.08]} />
          </mesh>
          {/* Marca del frente: el lado que mira a -z local. */}
          <mesh position={[0, 0.02, -foot.d / 2 - 0.09]} material={getHighlightMaterial("#7d3323")}>
            <boxGeometry args={[Math.min(foot.w * 0.5, 0.5), 0.02, 0.07]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function FurnitureLayer({
  level,
  visible,
  wallHeight,
  edit,
}: {
  level: Level;
  visible: boolean;
  /** Altura del corte de muros. El mobiliario se secciona igual, para que un
   *  clóset de 2.4 no tape el cuarto en planta. Con los muros ocultos no se
   *  corta nada: ahí lo que se quiere ver es justamente el amueblado. */
  wallHeight: number;
  edit?: FurnitureEdit;
}) {
  const floorY = levelFloorY(level);
  const { camera, gl } = useThree();
  // OrbitControls escucha el canvas por su cuenta, así que hay que frenarlo de
  // forma imperativa en el mismo tick del pointerdown; con estado de React
  // llegaría tarde y la cámara giraría junto con el arrastre.
  const controls = useThree((state) => state.controls) as { enabled: boolean } | null;

  const [dragging, setDragging] = useState<number | null>(null);
  // Offset entre el origen de la pieza y el punto agarrado. `null` = todavía no
  // se sabe: se fija en el primer movimiento, para que la pieza no dé un brinco.
  const grab = useRef<{ index: number; dx: number | null; dz: number | null } | null>(null);
  // Lo que el listener necesita leer sin volver a suscribirse en cada frame.
  const live = useRef({ edit, furniture: level.furniture, controls });
  live.current = { edit, furniture: level.furniture, controls };

  /**
   * El arrastre no usa los eventos de R3F sino un raycast propio contra el plano
   * del piso. Así la posición sale de la geometría y no de qué malla quedó
   * debajo del cursor, que es lo que hacía saltar la pieza.
   */
  useEffect(() => {
    if (dragging == null) return;
    const el = gl.domElement;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -floorY);
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();

    const onMove = (ev: PointerEvent) => {
      const state = grab.current;
      if (!state) return;
      const rect = el.getBoundingClientRect();
      ndc.set(
        ((ev.clientX - rect.left) / rect.width) * 2 - 1,
        -((ev.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(ndc, camera);
      if (!ray.ray.intersectPlane(plane, hit)) return;
      const piece = live.current.furniture[state.index];
      if (!piece) return;
      if (state.dx == null || state.dz == null) {
        state.dx = piece.x - hit.x;
        state.dz = piece.z - hit.z;
        return;
      }
      live.current.edit?.onMove(state.index, hit.x + state.dx, hit.z + state.dz, !ev.shiftKey);
    };

    const onUp = () => {
      grab.current = null;
      setDragging(null);
      if (live.current.controls) live.current.controls.enabled = true;
      live.current.edit?.onDragChange(false);
    };

    el.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, camera, gl, floorY]);

  if (!visible) return null;
  const cut = wallHeight < 0.05 ? Infinity : wallHeight;

  return (
    <group>
      {level.furniture.map((piece, i) => (
        <Piece
          key={`${piece.type}-${i}`}
          piece={piece}
          index={i}
          floorY={floorY}
          cut={cut}
          edit={edit}
          onGrab={(index) => {
            edit?.onSelect(index);
            edit?.onDragChange(true);
            if (controls) controls.enabled = false;
            grab.current = { index, dx: null, dz: null };
            setDragging(index);
          }}
        />
      ))}
    </group>
  );
}
