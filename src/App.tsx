import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";

import { levelSubtitle, propertyMetrics } from "./model/geometry";
import { LEVEL_DEFAULTS } from "./model/types";
import { PROPERTIES, getProperty } from "./properties";
import { Scene, type SceneLayers, type ViewMode } from "./scene/Scene";
import { Controls, WALL_HEIGHTS, type WallMode } from "./ui/Controls";
import { Legend } from "./ui/Legend";
import { RoomPanel } from "./ui/RoomPanel";
import { usePersistentState } from "./ui/usePersistentState";

export default function App() {
  const [propertyId, setPropertyId] = usePersistentState("property", PROPERTIES[0].id);
  const [view, setView] = usePersistentState<ViewMode>("view", "3d");
  const [wallMode, setWallMode] = usePersistentState<WallMode>("walls", "low");
  const [layers, setLayers] = usePersistentState<SceneLayers>("layers", {
    furniture: true,
    labels: true,
  });
  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const property = getProperty(propertyId);
  const level = property.levels[Math.min(levelIndex, property.levels.length - 1)];

  // Cambiar de casa no debe dejar seleccionado un cuarto que ya no existe.
  useEffect(() => {
    setSelectedRoom(null);
    setLevelIndex(0);
  }, [propertyId]);

  const metrics = propertyMetrics(property);
  const wallHeight = WALL_HEIGHTS[wallMode](level.wallHeight ?? LEVEL_DEFAULTS.wallHeight);

  return (
    <div className="app">
      {/* `flat` = sin tone mapping ACES: los colores de la paleta salen tal cual se autoraron. */}
      <Canvas
        shadows
        flat
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 400, position: [12, 12, 20] }}
        onPointerMissed={() => setSelectedRoom(null)}
      >
        <Scene
          level={level}
          view={view}
          wallHeight={wallHeight}
          layers={layers}
          selectedRoom={selectedRoom}
          onSelectRoom={setSelectedRoom}
        />
      </Canvas>

      <header className="header">
        <div className="card">
          <div className="card__title">{property.name}</div>
          <div className="card__sub">{levelSubtitle(property)}</div>
        </div>
        <Controls
          properties={PROPERTIES}
          property={property}
          onProperty={setPropertyId}
          levelIndex={levelIndex}
          onLevel={setLevelIndex}
          view={view}
          onView={setView}
          wallMode={wallMode}
          onWallMode={setWallMode}
          layers={layers}
          onLayers={setLayers}
        />
        <p className="hint">
          arrastra para girar · scroll o pellizco para zoom · click en un cuarto para su ficha
        </p>
      </header>

      {selectedRoom && (
        <RoomPanel level={level} roomId={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}

      <footer className="footer">
        <Legend level={level} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />
        <div className="totals">
          Área útil {metrics.interior.toFixed(1)} m²
          {metrics.exterior > 0.5 && ` · exterior ${metrics.exterior.toFixed(1)} m²`}
          <span className="totals__note"> (a paño interior, sin muros)</span>
        </div>
      </footer>
    </div>
  );
}
