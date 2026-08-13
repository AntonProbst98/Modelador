import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";

import { useFurnitureEditor } from "./editor/useFurnitureEditor";
import { levelSubtitle, propertyMetrics } from "./model/geometry";
import { LEVEL_DEFAULTS } from "./model/types";
import { PROPERTIES, getProperty } from "./properties";
import { Scene, type SceneLayers, type ViewMode } from "./scene/Scene";
import { Controls, WALL_HEIGHTS, type WallMode } from "./ui/Controls";
import { DimensionList } from "./ui/DimensionList";
import { EditorPanel } from "./ui/EditorPanel";
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
    dims: false,
    ao: true,
  });
  const [editing, setEditing] = useState(false);
  const [scenarioId, setScenarioId] = usePersistentState<string | null>("scenario", null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDim, setSelectedDim] = useState<string | null>(null);

  const property = getProperty(propertyId);
  const floor = property.levels[Math.min(levelIndex, property.levels.length - 1)];
  const scenario = property.scenarios?.find((s) => s.id === scenarioId) ?? null;
  // El escenario se aplica sobre el nivel base; el editor guarda su capa aparte
  // para cada uno, así que amueblar la remodelación no toca el estado actual.
  const baseLevel = useMemo(
    () => (scenario ? scenario.apply(floor) : floor),
    [scenario, floor],
  );
  const editor = useFurnitureEditor(`${property.id}:${scenarioId ?? "base"}`, baseLevel);

  // La escena entera se dibuja del nivel ya editado, así que las áreas, la ficha
  // de cuarto y la leyenda ven lo mismo que se está editando.
  const level = useMemo(
    () => ({ ...baseLevel, furniture: editor.items }),
    [baseLevel, editor.items],
  );

  // Cambiar de casa no debe dejar seleccionado un cuarto que ya no existe.
  useEffect(() => {
    setSelectedRoom(null);
    setLevelIndex(0);
  }, [propertyId]);

  // Atajos del editor. Sólo escuchan si no se está escribiendo en un campo.
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const i = editor.selected;
      if (e.key === "Escape") return editor.setSelected(null);
      if (i == null) return;
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        editor.rotate(i, e.shiftKey ? -90 : 90);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        editor.remove(i);
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const piece = editor.items[i];
        const step = e.shiftKey ? 0.01 : 0.05;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dz = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        editor.move(i, piece.x + dx, piece.z + dz, false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, editor]);

  const metrics = propertyMetrics(property);
  const wallHeight = WALL_HEIGHTS[wallMode](level.wallHeight ?? LEVEL_DEFAULTS.wallHeight);
  // Editar sin ver el mobiliario no tendría sentido.
  const sceneLayers = editing ? { ...layers, furniture: true, dims: false } : layers;

  return (
    <div className="app">
      {/*
        `flat` = sin tone mapping. Se probó ACES al meter luz ambiental y apaga la
        paleta: los pisos se van a beige y el verde de la terraza desaparece. Con
        color directo hay que cuidar no pasarse de luz, pero los colores salen
        tal cual se autoraron.
      */}
      <Canvas
        shadows
        flat
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 400, position: [12, 12, 20] }}
        onPointerMissed={() => {
          setSelectedRoom(null);
          if (editing) editor.setSelected(null);
        }}
      >
        <Scene
          level={level}
          view={view}
          wallHeight={wallHeight}
          layers={sceneLayers}
          selectedRoom={selectedRoom}
          onSelectRoom={setSelectedRoom}
          selectedDim={selectedDim}
          onSelectDim={setSelectedDim}
          edit={
            editing
              ? {
                  selected: editor.selected,
                  onSelect: editor.setSelected,
                  onMove: editor.move,
                }
              : undefined
          }
        />
      </Canvas>

      <header className="header">
        <div className="card">
          <div className="card__title">{property.name}</div>
          <div className="card__sub">{scenario?.summary ?? levelSubtitle(property)}</div>
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
          editing={editing}
          onEditing={setEditing}
          scenarioId={scenarioId}
          onScenario={setScenarioId}
        />
        <p className="hint">
          {editing
            ? "click para seleccionar · arrastra para mover · R gira · Supr borra"
            : "arrastra para girar · scroll o pellizco para zoom · click en un cuarto para su ficha"}
        </p>
      </header>

      {editing ? (
        <EditorPanel level={level} editor={editor} />
      ) : layers.dims ? (
        <DimensionList level={level} selected={selectedDim} onSelect={setSelectedDim} />
      ) : (
        selectedRoom && (
          <RoomPanel level={level} roomId={selectedRoom} onClose={() => setSelectedRoom(null)} />
        )
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
