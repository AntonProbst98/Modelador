import type { ViewMode } from "../scene/Scene";
import type { Property } from "../model/types";

export type WallMode = "none" | "low" | "full";

export const WALL_HEIGHTS: Record<WallMode, (full: number) => number> = {
  none: () => 0,
  low: () => 1.05,
  full: (full) => full,
};

const WALL_LABEL: Record<WallMode, string> = {
  none: "Sin muros",
  low: "Muros bajos",
  full: "Muros altos",
};

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className={`chip${active ? " is-active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function Controls({
  properties,
  property,
  onProperty,
  levelIndex,
  onLevel,
  view,
  onView,
  wallMode,
  onWallMode,
  layers,
  onLayers,
}: {
  properties: Property[];
  property: Property;
  onProperty: (id: string) => void;
  levelIndex: number;
  onLevel: (i: number) => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  wallMode: WallMode;
  onWallMode: (m: WallMode) => void;
  layers: { furniture: boolean; labels: boolean };
  onLayers: (l: { furniture: boolean; labels: boolean }) => void;
}) {
  return (
    <div className="controls">
      <div className="chip-row">
        {properties.map((p) => (
          <Chip key={p.id} active={p.id === property.id} onClick={() => onProperty(p.id)}>
            {p.location}
          </Chip>
        ))}
      </div>

      {property.levels.length > 1 && (
        <div className="chip-row">
          {property.levels.map((l, i) => (
            <Chip key={l.id} active={i === levelIndex} onClick={() => onLevel(i)}>
              {l.name}
            </Chip>
          ))}
        </div>
      )}

      <div className="chip-row">
        <Chip active={view === "3d"} onClick={() => onView("3d")}>
          Vista 3D
        </Chip>
        <Chip active={view === "top"} onClick={() => onView("top")}>
          Planta
        </Chip>
        <Chip
          onClick={() =>
            onWallMode(wallMode === "low" ? "full" : wallMode === "full" ? "none" : "low")
          }
        >
          {WALL_LABEL[wallMode]}
        </Chip>
      </div>

      <div className="chip-row">
        <Chip
          active={layers.furniture}
          onClick={() => onLayers({ ...layers, furniture: !layers.furniture })}
        >
          Mobiliario
        </Chip>
        <Chip active={layers.labels} onClick={() => onLayers({ ...layers, labels: !layers.labels })}>
          Etiquetas
        </Chip>
      </div>
    </div>
  );
}
