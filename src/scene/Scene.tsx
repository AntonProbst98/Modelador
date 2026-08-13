import { Environment, Lightformer, OrbitControls, SoftShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { levelBBox, levelFloorY } from "../model/geometry";
import type { Level } from "../model/types";
import { Dimensions } from "./Dimensions";
import { FurnitureLayer, type FurnitureEdit } from "./FurnitureLayer";
import { Labels } from "./Labels";
import { Structure } from "./Structure";
import { getMaterial } from "./materials";

export type ViewMode = "3d" | "top";

export interface SceneLayers {
  furniture: boolean;
  labels: boolean;
  dims: boolean;
}

/** Encuadre y transición de cámara. Las vistas son metas a las que se llega interpolando. */
function CameraRig({
  view,
  center,
  radius,
  enabled,
}: {
  view: ViewMode;
  center: THREE.Vector3;
  radius: number;
  /** Se apaga mientras se arrastra un mueble, si no el orbit pelea con el drag. */
  enabled: boolean;
}) {
  const controls = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const goal = useRef<THREE.Vector3 | null>(null);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    // Metas en esféricas. En "planta" el desfase va sólo sobre z: en el cenit
    // exacto el azimut es indeterminado y el plano sale girado.
    const [theta, phi, zoom] = view === "top" ? [0, 0.14, 1.3] : [0.5, 0.95, 1];
    const r = radius * zoom;
    goal.current = new THREE.Vector3(
      center.x + r * Math.sin(phi) * Math.sin(theta),
      center.y + r * Math.cos(phi),
      center.z + r * Math.sin(phi) * Math.cos(theta),
    );
    setAuto(view === "3d");
  }, [view, center, radius]);

  useFrame((_, delta) => {
    if (!goal.current) return;
    // Suavizado por tiempo, no por frame: la transición dura lo mismo a 15 o a 120 fps.
    camera.position.lerp(goal.current, 1 - Math.exp(-6 * Math.min(delta, 0.1)));
    if (camera.position.distanceTo(goal.current) < 0.06) goal.current = null;
    controls.current?.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={center}
      enabled={enabled}
      enableDamping
      dampingFactor={0.08}
      autoRotate={auto && enabled}
      autoRotateSpeed={0.45}
      minPolarAngle={0.1}
      maxPolarAngle={1.45}
      minDistance={radius * 0.35}
      maxDistance={radius * 3}
      onStart={() => {
        goal.current = null;
        setAuto(false);
      }}
    />
  );
}

export function Scene({
  level,
  view,
  wallHeight,
  layers,
  selectedRoom,
  onSelectRoom,
  selectedDim,
  onSelectDim,
  edit,
}: {
  level: Level;
  view: ViewMode;
  wallHeight: number;
  layers: SceneLayers;
  selectedRoom: string | null;
  onSelectRoom: (id: string | null) => void;
  selectedDim: string | null;
  onSelectDim: (id: string | null) => void;
  edit?: Omit<FurnitureEdit, "onDragChange">;
}) {
  const [dragging, setDragging] = useState(false);
  const { size } = useThree();
  const box = useMemo(() => levelBBox(level), [level]);
  const floorY = levelFloorY(level);

  const center = useMemo(
    () => new THREE.Vector3((box.x1 + box.x2) / 2, 0, (box.z1 + box.z2) / 2),
    [box],
  );
  const span = Math.max(box.x2 - box.x1, box.z2 - box.z1);
  const radius = span * (size.width / Math.max(size.height, 1) < 0.9 ? 1.85 : 1.4);

  // El objetivo del sol vive en la escena para que el frustum de sombra encuadre la casa.
  const sunTarget = useMemo(() => new THREE.Object3D(), []);
  sunTarget.position.copy(center);

  return (
    <>
      {/*
        La luz ambiental es un cielo procedural, no un HDR de disco: tres paneles
        que se renderizan una sola vez a un cubemap. Eso da el relleno suave y los
        reflejos de borde que una hemisphereLight plana no puede dar, y el proyecto
        sigue sin depender de ningún archivo externo.
      */}
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={0.32} color="#fff6ea" position={[0, 12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[24, 24, 1]} />
        <Lightformer intensity={0.12} color="#cfd9e2" position={[-14, 5, 0]} rotation={[0, Math.PI / 2, 0]} scale={[16, 10, 1]} />
        <Lightformer intensity={0.1} color="#f0e2cc" position={[14, 4, 8]} rotation={[0, -Math.PI / 2, 0]} scale={[16, 10, 1]} />
        <Lightformer intensity={0.05} color="#b9ae9c" position={[0, -6, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[24, 24, 1]} />
      </Environment>

      {/* Penumbra: la sombra se abre con la distancia, como una sombra de verdad. */}
      <SoftShadows size={14} samples={12} focus={0.6} />

      <ambientLight intensity={0.08} color="#fff4e4" />
      <primitive object={sunTarget} />
      <directionalLight
        position={[center.x + span * 0.9, span * 1.9, center.z + span * 1.0]}
        intensity={2.2}
        castShadow
        target={sunTarget}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={span * 6}
        shadow-camera-left={-span * 0.95}
        shadow-camera-right={span * 0.95}
        shadow-camera-top={span * 0.95}
        shadow-camera-bottom={-span * 0.95}
      />

      {/* Plano que sólo recibe sombra: asienta la casa sin pintar un suelo. */}
      <mesh position={[center.x, -0.14, center.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[span * 8, span * 8]} />
        <shadowMaterial opacity={0.22} />
      </mesh>

      <Structure
        level={level}
        wallHeight={wallHeight}
        selectedRoom={selectedRoom}
        onSelectRoom={onSelectRoom}
      />
      <FurnitureLayer
        level={level}
        visible={layers.furniture}
        wallHeight={wallHeight}
        edit={edit ? { ...edit, onDragChange: setDragging } : undefined}
      />
      <Labels
        level={level}
        visible={layers.labels}
        selectedRoom={selectedRoom}
        onSelectRoom={onSelectRoom}
      />
      <Dimensions
        level={level}
        visible={layers.dims}
        selected={selectedDim}
        onSelect={onSelectDim}
      />

      {level.entry && (
        <mesh
          position={[level.entry.x, floorY + 0.22, level.entry.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={getMaterial("#c2603f")}
          castShadow
        >
          <cylinderGeometry args={[0.001, 0.14, 0.4, 20]} />
        </mesh>
      )}

      <CameraRig view={view} center={center} radius={radius} enabled={!dragging} />
    </>
  );
}
