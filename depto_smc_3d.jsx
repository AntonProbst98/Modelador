import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ---------------------------------------------------------------
// Depto San Miguel Chapultepec — modelo 3D con medidas reales
// Ejes: x = 0..9.6 (frente, izq→der del sketch), z = 0..11 (fondo)
// ---------------------------------------------------------------

const W = 9.6;
const D = 11.0;
const FY = 0.08; // altura del piso terminado

// Muros exteriores [x1, z1, x2, z2]
const EXT_WALLS = [
  [0, 0, 0.16, D], // izquierda
  [0.16, 0, W, 0.16], // frente/terraza
  [9.44, 0.16, W, 10.0], // derecha (hasta el recorte)
  [6.9, 9.84, 9.44, 10.0], // recorte horizontal
  [6.9, 10.0, 7.06, 10.84], // recorte vertical
  [0.16, 10.84, 0.35, 11.0], // fondo, tramo corto
  [1.25, 10.84, 7.06, 11.0], // fondo (hueco de entrada 0.35–1.25)
];

// Muros interiores
const INT_WALLS = [
  [2.2, 2.45, 5.85, 2.55], // terraza / cuarto Antón
  [2.15, 2.45, 2.25, 5.5], // extensión+lavandería / cuarto Antón
  [0.16, 3.75, 0.5, 3.85], // extensión / lavandería (con paso)
  [1.4, 3.75, 2.15, 3.85],
  [5.85, 0.16, 5.95, 0.8], // terraza / cuarto principal (puerta a terraza)
  [5.85, 1.7, 5.95, 2.55],
  [5.85, 2.55, 5.95, 4.4], // Antón / vestíbulo (puerta 4.4–5.25)
  [5.85, 5.25, 5.95, 6.2], // sigue como costado de cocina
  [0.16, 5.5, 0.5, 5.6], // muro medio (puerta cocina↔lavandería)
  [1.3, 5.5, 5.85, 5.6],
  [6.9, 3.65, 9.44, 3.75], // cuarto principal / vestíbulo (puerta 5.95–6.9)
  [6.95, 3.75, 7.05, 4.5], // vestíbulo / baño ppal (puerta 4.5–5.3)
  [6.95, 5.3, 7.05, 5.5],
  [6.95, 5.5, 9.44, 5.6], // baño ppal / baño visitas
  [6.95, 6.45, 7.05, 7.4], // pasillo / baño visitas (puerta 5.6–6.45)
  [0.85, 7.4, 5.85, 7.5], // cocina / comedor (paso a la izq.)
  [6.95, 7.4, 9.44, 7.5], // baño visitas / comedor
];

// Pisos por zona [x1, z1, x2, z2, color]
const FLOORS = [
  [0.16, 0.16, 5.85, 2.45, "#a9c19b"], // terraza
  [0.16, 2.45, 2.15, 3.75, "#a9c19b"], // extensión terraza
  [5.95, 0.16, 9.44, 3.65, "#ecd7ba"], // cuarto principal
  [5.95, 3.75, 6.95, 7.4, "#d8c6a8"], // vestíbulo + pasillo
  [2.25, 2.55, 5.85, 5.5, "#e6d2b4"], // cuarto Antón
  [0.16, 3.85, 2.15, 5.5, "#d3d8cd"], // lavandería
  [0.16, 5.6, 5.85, 7.4, "#d9d2c4"], // cocina
  [7.05, 3.75, 9.44, 5.5, "#ccd7d5"], // baño principal
  [7.05, 5.6, 9.44, 7.4, "#c7d3d1"], // baño visitas
  [0.16, 7.5, 9.44, 9.84, "#e0cdae"], // sala/comedor A
  [0.16, 9.84, 6.9, 10.84, "#e0cdae"], // sala/comedor B (recorte)
];

// Umbrales / vanos de puertas
const THRESHOLDS = [
  [5.85, 4.4, 5.95, 5.25],
  [5.95, 3.65, 6.9, 3.75],
  [6.95, 4.5, 7.05, 5.3],
  [6.95, 5.6, 7.05, 6.45],
  [5.85, 0.8, 5.95, 1.7],
  [0.5, 3.75, 1.4, 3.85],
  [0.5, 5.5, 1.3, 5.6],
  [0.35, 10.84, 1.25, 11.0],
  [0.16, 7.4, 0.85, 7.5],
  [5.95, 7.4, 6.95, 7.5],
  [5.85, 6.2, 5.95, 7.4],
];

// Arcos de puerta [bisagraX, bisagraZ, radio, thetaStart]
const DOORS = [
  [5.85, 5.25, 0.85, Math.PI / 2], // cuarto Antón
  [6.9, 3.65, 0.9, Math.PI / 2], // cuarto principal
  [7.05, 4.5, 0.8, (3 * Math.PI) / 2], // baño ppal
  [7.05, 6.45, 0.8, 0], // baño visitas
  [5.85, 1.7, 0.85, Math.PI / 2], // principal → terraza
  [1.25, 10.84, 0.85, Math.PI / 2], // entrada
  [1.3, 5.6, 0.75, Math.PI], // cocina → lavandería
];

const LABELS = [
  ["Terraza", 2.9, 1.35, 1],
  ["Cuarto principal", 7.7, 1.9, 0.78],
  ["Baño ppal.", 8.2, 4.6, 0.6],
  ["Cuarto Antón", 4.05, 4.05, 0.85],
  ["Lavandería", 1.15, 4.6, 0.55],
  ["Cocina", 2.95, 6.5, 0.75],
  ["Baño visitas", 8.2, 6.8, 0.58],
  ["Sala · Comedor", 4.6, 9.5, 0.95],
];

const LEGEND = [
  { n: "Sala · Comedor", d: "≈ 29 m²", c: "#e0cdae" },
  { n: "Terraza", d: "≈ 18 m²", c: "#a9c19b" },
  { n: "Cuarto principal", d: "3.6 × 3.75", c: "#ecd7ba" },
  { n: "Cuarto Antón", d: "3.7 × 3", c: "#e6d2b4" },
  { n: "Cocina", d: "≈ 10 m²", c: "#d9d2c4" },
  { n: "Baño ppal.", d: "≈ 4.9 m²", c: "#ccd7d5" },
  { n: "Baño visitas", d: "2.5 × 1.83", c: "#c7d3d1" },
  { n: "Lavandería", d: "≈ 3.5 m²", c: "#d3d8cd" },
];

function Btn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1.5 text-xs font-semibold shadow"
      style={{
        background: active ? "#4a5d47" : "rgba(255,253,248,0.92)",
        color: active ? "#f6f2e8" : "#5a4c3c",
        border: "1px solid rgba(90,75,60,0.18)",
      }}
    >
      {children}
    </button>
  );
}

export default function DeptoSMC() {
  const mountRef = useRef(null);
  const apiRef = useRef(null);
  const [view, setViewState] = useState("3d");
  const [wallsHigh, setWallsHigh] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ---------- Renderer / escena ----------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      300
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xfff7e9, 0xb7ad9c, 0.95);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(14, 20, 16);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -13;
    sun.shadow.camera.right = 13;
    sun.shadow.camera.top = 13;
    sun.shadow.camera.bottom = -13;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 70;
    sun.shadow.bias = -0.0004;
    sun.target.position.set(W / 2, 0, D / 2);
    scene.add(sun);
    scene.add(sun.target);

    const target = new THREE.Vector3(4.8, 0, 5.7);

    // ---------- Helpers ----------
    const mat = (c, o = {}) =>
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, metalness: 0, ...o });

    const world = new THREE.Group();
    scene.add(world);

    function box(w, h, d, x, y, z, m, opts = {}) {
      const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      g.position.set(x, y, z);
      if (opts.ry) g.rotation.y = opts.ry;
      g.castShadow = opts.cast !== false;
      g.receiveShadow = true;
      world.add(g);
      return g;
    }
    function slab(x1, z1, x2, z2, m, h = 0.08, yTop = null) {
      const yy = yTop == null ? h / 2 : yTop - h / 2;
      return box(x2 - x1, h, z2 - z1, (x1 + x2) / 2, yy, (z1 + z2) / 2, m, { cast: false });
    }
    function cyl(rt, rb, h, x, y, z, m, seg = 28) {
      const g = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
      g.position.set(x, y, z);
      g.castShadow = true;
      g.receiveShadow = true;
      world.add(g);
      return g;
    }
    function makeLabel(text, size = 1) {
      const fs = 58;
      const pad = 26;
      let c = document.createElement("canvas");
      let ctx = c.getContext("2d");
      ctx.font = "600 " + fs + "px ui-sans-serif, system-ui, sans-serif";
      const tw = ctx.measureText(text).width;
      c.width = Math.ceil(tw + pad * 2);
      c.height = 92;
      ctx = c.getContext("2d");
      ctx.font = "600 " + fs + "px ui-sans-serif, system-ui, sans-serif";
      ctx.textBaseline = "middle";
      const rr = (x, y, wd, ht, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + wd, y, x + wd, y + ht, r);
        ctx.arcTo(x + wd, y + ht, x, y + ht, r);
        ctx.arcTo(x, y + ht, x, y, r);
        ctx.arcTo(x, y, x + wd, y, r);
        ctx.closePath();
      };
      rr(1, 6, c.width - 2, 80, 40);
      ctx.fillStyle = "rgba(255,253,247,0.92)";
      ctx.fill();
      ctx.strokeStyle = "rgba(90,75,60,0.28)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#4a3d2f";
      ctx.fillText(text, pad, 48);
      const tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
      );
      const k = 0.0062 * size;
      sp.scale.set(c.width * k, c.height * k, 1);
      sp.renderOrder = 999;
      world.add(sp);
      return sp;
    }

    // ---------- Terreno ----------
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.ShadowMaterial({ opacity: 0.16 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(W / 2, -0.14, D / 2);
    ground.receiveShadow = true;
    scene.add(ground);

    const baseMat = mat("#8f8069");
    slab(-0.15, -0.15, 9.75, 10.15, baseMat, 0.12, 0);
    slab(-0.15, 10.15, 7.21, 11.15, baseMat, 0.12, 0);

    // ---------- Pisos ----------
    FLOORS.forEach(([x1, z1, x2, z2, c]) => slab(x1, z1, x2, z2, mat(c), FY));
    const thMat = mat("#cdb693");
    THRESHOLDS.forEach(([x1, z1, x2, z2]) => slab(x1, z1, x2, z2, thMat, 0.07));

    // ---------- Muros (altura animable) ----------
    const wallMat = mat("#f2ecdf", { roughness: 0.95 });
    const walls = [];
    [...EXT_WALLS, ...INT_WALLS].forEach(([x1, z1, x2, z2]) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(Math.max(x2 - x1, 0.02), 1, Math.max(z2 - z1, 0.02)),
        wallMat
      );
      m.position.set((x1 + x2) / 2, 0.525, (z1 + z2) / 2);
      m.castShadow = true;
      m.receiveShadow = true;
      world.add(m);
      walls.push(m);
    });
    let wallH = 1.05;
    let wallHTarget = 1.05;

    // ---------- Arcos de puerta ----------
    const arcMat = new THREE.MeshBasicMaterial({
      color: 0x9b7f5e,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    DOORS.forEach(([hx, hz, r, t0]) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.035, r, 26, 1, t0, Math.PI / 2), arcMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(hx, FY + 0.02, hz);
      world.add(ring);
    });

    // ---------- Materiales de mobiliario ----------
    const white = mat("#f3f2ee");
    const wood = mat("#b6a488");
    const woodDark = mat("#8b7355");
    const topMat = mat("#efeade");
    const dark = mat("#26262a");
    const linen = mat("#e4ddd0");
    const glass = mat("#bcd7dc", { transparent: true, opacity: 0.35, roughness: 0.15 });
    const green = mat("#6f9a5d");
    const pot = mat("#b5714f");
    const tile = mat("#e8eef0");

    // ---------- Cuarto principal ----------
    box(1.6, 0.38, 2.0, 7.8, FY + 0.19, 1.4, linen);
    box(1.6, 0.72, 0.08, 7.8, FY + 0.36, 0.44, woodDark);
    box(1.62, 0.06, 1.0, 7.8, FY + 0.41, 1.85, mat("#9b8ea4"));
    box(0.62, 0.1, 0.3, 7.45, FY + 0.43, 0.68, white);
    box(0.62, 0.1, 0.3, 8.15, FY + 0.43, 0.68, white);
    box(0.45, 0.42, 0.45, 6.68, FY + 0.21, 0.63, wood);
    box(0.45, 0.42, 0.45, 8.92, FY + 0.21, 0.63, wood);
    box(0.5, 1.3, 1.7, 9.17, FY + 0.65, 2.6, wood);

    // ---------- Baño principal ----------
    box(1.2, 0.8, 0.48, 7.77, FY + 0.4, 4.05, mat("#cabfae"));
    box(1.24, 0.05, 0.52, 7.77, FY + 0.825, 4.05, mat("#f6f4ef"));
    cyl(0.15, 0.12, 0.06, 7.77, FY + 0.875, 4.05, tile);
    box(0.9, 0.05, 1.6, 8.94, FY + 0.025, 4.62, tile);
    box(0.04, 1.0, 1.6, 8.47, FY + 0.5, 4.62, glass);
    box(0.38, 0.3, 0.52, 8.15, FY + 0.15, 5.12, white);
    box(0.4, 0.48, 0.14, 8.15, FY + 0.32, 5.42, white);

    // ---------- Cuarto Antón ----------
    box(2.0, 0.38, 1.4, 3.3, FY + 0.19, 3.55, linen);
    box(0.08, 0.72, 1.4, 2.34, FY + 0.36, 3.55, woodDark);
    box(0.95, 0.06, 1.42, 3.78, FY + 0.41, 3.55, mat("#7d8ea0"));
    box(0.3, 0.1, 1.1, 2.55, FY + 0.43, 3.55, white);
    box(1.3, 0.7, 0.55, 5.0, FY + 0.35, 2.9, wood);
    box(1.34, 0.04, 0.59, 5.0, FY + 0.72, 2.9, topMat);
    box(0.5, 0.32, 0.04, 5.0, FY + 0.97, 2.75, dark);
    // setup de DJ
    box(1.4, 0.8, 0.5, 4.2, FY + 0.4, 5.15, mat("#5a5148"));
    cyl(0.16, 0.16, 0.05, 3.78, FY + 0.855, 5.15, dark);
    cyl(0.16, 0.16, 0.05, 4.62, FY + 0.855, 5.15, dark);
    box(0.3, 0.06, 0.34, 4.2, FY + 0.86, 5.15, mat("#333333"));
    cyl(0.55, 0.55, 0.02, 4.6, FY + 0.015, 4.1, mat("#cbb9a0"));

    // ---------- Lavandería ----------
    box(0.62, 1.35, 0.62, 1.76, FY + 0.675, 4.2, white);
    const wdoor1 = cyl(0.18, 0.18, 0.03, 1.43, FY + 0.42, 4.2, mat("#8fa6b5"));
    wdoor1.rotation.z = Math.PI / 2;
    const wdoor2 = cyl(0.18, 0.18, 0.03, 1.43, FY + 0.97, 4.2, mat("#8fa6b5"));
    wdoor2.rotation.z = Math.PI / 2;
    box(0.5, 0.8, 0.5, 1.82, FY + 0.4, 5.15, mat("#cfd5d6"));
    box(0.54, 0.06, 0.54, 1.82, FY + 0.83, 5.15, mat("#dfe5e6"));

    // ---------- Cocina ----------
    box(4.3, 0.8, 0.55, 3.6, FY + 0.4, 5.925, wood);
    box(4.34, 0.05, 0.59, 3.6, FY + 0.825, 5.925, topMat);
    box(0.6, 0.02, 0.5, 3.0, FY + 0.86, 5.92, mat("#3b3b3d"));
    [
      [2.85, 5.79],
      [3.15, 5.79],
      [2.85, 6.05],
      [3.15, 6.05],
    ].forEach(([bx, bz]) => cyl(0.08, 0.08, 0.012, bx, FY + 0.875, bz, mat("#1e1e1e")));
    box(3.35, 0.8, 0.5, 2.62, FY + 0.4, 7.1, wood);
    box(3.39, 0.05, 0.54, 2.62, FY + 0.825, 7.1, topMat);
    box(0.6, 0.02, 0.36, 2.0, FY + 0.86, 7.1, mat("#cfd8da"));
    box(0.72, 1.8, 0.7, 4.75, FY + 0.9, 7.0, mat("#eef0f1"));
    box(0.03, 0.6, 0.04, 4.5, FY + 1.07, 6.63, mat("#c8ccce"));

    // ---------- Baño visitas ----------
    cyl(0.07, 0.11, 0.7, 8.0, FY + 0.35, 5.95, white);
    cyl(0.23, 0.23, 0.06, 8.0, FY + 0.73, 5.95, white);
    box(0.38, 0.3, 0.52, 9.0, FY + 0.15, 6.05, white);
    box(0.4, 0.48, 0.14, 9.0, FY + 0.32, 5.74, white);
    box(1.7, 0.05, 0.75, 8.5, FY + 0.025, 7.0, tile);
    box(1.7, 1.0, 0.04, 8.5, FY + 0.5, 6.6, glass);

    // ---------- Sala / Comedor ----------
    cyl(0.75, 0.75, 0.06, 3.2, FY + 0.71, 8.9, mat("#c9a877"));
    cyl(0.09, 0.13, 0.65, 3.2, FY + 0.355, 8.9, woodDark);
    [45, 135, 225, 315].forEach((deg) => {
      const a = (deg * Math.PI) / 180;
      const sx = 3.2 + Math.cos(a) * 1.15;
      const sz = 8.9 + Math.sin(a) * 1.15;
      const seat = box(0.4, 0.4, 0.4, sx, FY + 0.2, sz, wood);
      seat.rotation.y = Math.PI / 2 - a;
      const back = box(0.4, 0.45, 0.05, sx + Math.cos(a) * 0.19, FY + 0.505, sz + Math.sin(a) * 0.19, wood);
      back.rotation.y = Math.PI / 2 - a;
    });
    box(1.6, 0.42, 0.35, 8.2, FY + 0.21, 7.7, woodDark);
    box(1.4, 0.78, 0.05, 8.2, FY + 1.18, 7.56, mat("#17181b"));
    box(2.8, 0.02, 2.4, 8.2, FY + 0.015, 8.75, mat("#d6c3a8"), { cast: false });
    box(2.2, 0.42, 0.95, 8.2, FY + 0.21, 9.3, mat("#93a1ad"));
    box(2.2, 0.45, 0.2, 8.2, FY + 0.635, 9.675, mat("#93a1ad"));
    box(0.22, 0.52, 0.95, 7.21, FY + 0.26, 9.3, mat("#93a1ad"));
    box(0.22, 0.52, 0.95, 9.19, FY + 0.26, 9.3, mat("#93a1ad"));
    box(0.9, 0.28, 0.5, 8.2, FY + 0.14, 8.55, wood);
    box(1.5, 0.68, 0.4, 3.0, FY + 0.34, 10.58, woodDark);

    // ---------- Plantas ----------
    function plant(x, z, s) {
      cyl(0.2 * s, 0.15 * s, 0.3 * s, x, FY + 0.15 * s, z, pot);
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.28 * s, 18, 14), green);
      f.position.set(x, FY + 0.3 * s + 0.2 * s, z);
      f.castShadow = true;
      world.add(f);
    }
    plant(0.55, 0.55, 1.15);
    plant(1.35, 0.45, 0.85);
    plant(5.45, 0.5, 0.95);
    plant(0.5, 2.05, 0.9);
    plant(0.9, 3.35, 1.0);
    plant(1.8, 3.3, 0.75);
    plant(0.55, 7.95, 0.95);
    plant(5.35, 10.3, 1.0);

    // ---------- Terraza: mesa, sillas, camastro ----------
    cyl(0.42, 0.42, 0.05, 3.9, FY + 0.64, 1.5, mat("#8d7a5f"));
    cyl(0.05, 0.09, 0.62, 3.9, FY + 0.31, 1.5, mat("#8d7a5f"));
    box(0.4, 0.42, 0.4, 3.15, FY + 0.21, 1.5, mat("#7e6c53"));
    box(0.4, 0.42, 0.4, 4.65, FY + 0.21, 1.5, mat("#7e6c53"));
    box(0.62, 0.26, 1.5, 2.35, FY + 0.13, 1.05, mat("#c9b18a"));

    // ---------- Pasillo ----------
    box(0.6, 0.015, 3.2, 6.45, FY + 0.012, 5.4, mat("#bfa287"), { cast: false });

    // ---------- Entrada ----------
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.14, 0.4, 20), mat("#c2603f"));
    cone.rotation.x = -Math.PI / 2;
    cone.position.set(0.8, 0.3, 11.4);
    cone.castShadow = true;
    world.add(cone);
    const entradaLbl = makeLabel("Entrada", 0.6);
    entradaLbl.position.set(0.8, 0.55, 11.85);

    // ---------- Etiquetas ----------
    LABELS.forEach(([t, x, z, s]) => {
      const sp = makeLabel(t, s);
      sp.position.set(x, 1.45, z);
    });

    // ---------- Cámara y controles ----------
    const aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
    const baseR = aspect < 0.9 ? 19.5 : 15;
    const st = { theta: 0.5, phi: 0.95, radius: baseR, dragging: false, px: 0, py: 0, pinch: 0 };
    const goal = { active: false, theta: 0, phi: 0, radius: 0 };
    let autoRot = true;

    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
    function applyCam() {
      camera.position.set(
        target.x + st.radius * Math.sin(st.phi) * Math.sin(st.theta),
        target.y + st.radius * Math.cos(st.phi),
        target.z + st.radius * Math.sin(st.phi) * Math.cos(st.theta)
      );
      camera.lookAt(target);
    }

    const el = renderer.domElement;
    const onPointerDown = (e) => {
      st.dragging = true;
      goal.active = false;
      autoRot = false;
      st.px = e.clientX;
      st.py = e.clientY;
      el.style.cursor = "grabbing";
      try {
        el.setPointerCapture(e.pointerId);
      } catch (err) {}
    };
    const onPointerMove = (e) => {
      if (!st.dragging || st.pinch) return;
      const dx = e.clientX - st.px;
      const dy = e.clientY - st.py;
      st.px = e.clientX;
      st.py = e.clientY;
      st.theta -= dx * 0.005;
      st.phi = clamp(st.phi - dy * 0.005, 0.12, 1.45);
    };
    const onPointerUp = () => {
      st.dragging = false;
      el.style.cursor = "grab";
    };
    const onWheel = (e) => {
      e.preventDefault();
      goal.active = false;
      st.radius = clamp(st.radius * (1 + e.deltaY * 0.0012), 6, 42);
    };
    const dist = (t) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onTouchStart = (e) => {
      if (e.touches.length === 2) st.pinch = dist(e.touches);
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 2 && st.pinch) {
        e.preventDefault();
        const d2 = dist(e.touches);
        st.radius = clamp((st.radius * st.pinch) / d2, 6, 42);
        st.pinch = d2;
        goal.active = false;
      }
    };
    const onTouchEnd = () => {
      st.pinch = 0;
    };
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    apiRef.current = {
      setView: (v) => {
        goal.active = true;
        if (v === "top") {
          autoRot = false;
          goal.theta = 0;
          goal.phi = 0.12;
          goal.radius = baseR * 1.12;
        } else {
          autoRot = true;
          goal.theta = 0.5;
          goal.phi = 0.95;
          goal.radius = baseR;
        }
      },
      setWalls: (h) => {
        wallHTarget = h;
      },
    };

    // ---------- Loop ----------
    let raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (goal.active) {
        st.theta += (goal.theta - st.theta) * 0.08;
        st.phi += (goal.phi - st.phi) * 0.08;
        st.radius += (goal.radius - st.radius) * 0.08;
        if (
          Math.abs(goal.theta - st.theta) < 0.004 &&
          Math.abs(goal.phi - st.phi) < 0.004 &&
          Math.abs(goal.radius - st.radius) < 0.05
        )
          goal.active = false;
      } else if (autoRot && !st.dragging) {
        st.theta += dt * 0.06;
      }
      wallH += (wallHTarget - wallH) * 0.12;
      walls.forEach((m) => {
        m.scale.y = wallH;
        m.position.y = FY + wallH / 2 - 0.03;
      });
      applyCam();
      renderer.render(scene, camera);
    };
    tick();

    // ---------- Resize ----------
    const onResize = () => {
      const w = mount.clientWidth;
      const h = Math.max(mount.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // ---------- Cleanup ----------
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((mm) => mm.dispose());
          else o.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (apiRef.current) apiRef.current.setView(view);
  }, [view]);
  useEffect(() => {
    if (apiRef.current) apiRef.current.setWalls(wallsHigh ? 2.45 : 1.05);
  }, [wallsHigh]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "100vh",
        background: "linear-gradient(160deg,#f8f3e9 0%,#efe6d4 55%,#e4d8c1 100%)",
      }}
    >
      <div ref={mountRef} className="absolute inset-0" />

      <div className="absolute top-3 left-3 right-3 flex flex-col gap-2 pointer-events-none">
        <div
          className="pointer-events-auto self-start rounded-2xl px-4 py-2 shadow"
          style={{ background: "rgba(255,253,248,0.9)", backdropFilter: "blur(8px)" }}
        >
          <div className="text-base font-semibold" style={{ color: "#3f342a" }}>
            Depto · San Miguel Chapultepec
          </div>
          <div className="text-xs" style={{ color: "#8a7a66" }}>
            9.6 m de frente · interior ≈ 84 m² + terraza ≈ 18 m²
          </div>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <Btn active={view === "3d"} onClick={() => setViewState("3d")}>
            Vista 3D
          </Btn>
          <Btn active={view === "top"} onClick={() => setViewState("top")}>
            Planta
          </Btn>
          <Btn active={wallsHigh} onClick={() => setWallsHigh((v) => !v)}>
            {wallsHigh ? "Muros altos" : "Muros bajos"}
          </Btn>
        </div>
        <div className="text-xs" style={{ color: "#8a7a66" }}>
          arrastra para girar · scroll o pellizco para zoom
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <div
          className="flex gap-2 overflow-x-auto px-3 pb-3 pt-6 pointer-events-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {LEGEND.map((r) => (
            <div
              key={r.n}
              className="flex items-center gap-2 rounded-full px-3 py-1 text-xs whitespace-nowrap shadow"
              style={{
                background: "rgba(255,253,248,0.92)",
                color: "#4a3d2f",
                border: "1px solid rgba(90,75,60,0.15)",
              }}
            >
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: r.c }} />
              <span className="font-semibold">{r.n}</span>
              <span style={{ color: "#9a8a74" }}>{r.d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
