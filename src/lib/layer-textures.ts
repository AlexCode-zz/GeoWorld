import * as THREE from "three";

import type { LayerId } from "@/lib/earth-layers";

/**
 * Texturas procedurales de las capas internas.
 *
 * Las caras de corte del modelo son `RingGeometry`/`CircleGeometry`, cuyas UV
 * van en coordenadas de disco (`uv = (posición / radio + 1) / 2`): por eso las
 * texturas se pintan como un disco centrado, con el centro en (0.5, 0.5). Así
 * las bandas, vetas y facetas quedan alineadas con el radio real de cada capa y
 * se pueden girar alrededor del centro para animar las corrientes.
 *
 * Todo se genera en el cliente con un canvas (la escena va con `ssr: false`) y
 * es determinista: la misma semilla da siempre la misma textura.
 */

type RGB = readonly [number, number, number];
type DiscSampler = (u: number, v: number, radius: number, angle: number) => RGB;

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

function mix(a: RGB, b: RGB, t: number): RGB {
  const k = clamp01(t);

  return [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k,
  ];
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / (edge1 - edge0));

  return t * t * (3 - 2 * t);
}

function hash2(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;

  return value - Math.floor(value);
}

/** Ruido de valor con interpolación quíntica: base barroca pero sin costuras. */
function valueNoise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const a = hash2(x0, y0);
  const b = hash2(x0 + 1, y0);
  const c = hash2(x0, y0 + 1);
  const d = hash2(x0 + 1, y0 + 1);
  const top = a + (b - a) * ux;
  const bottom = c + (d - c) * ux;

  return top + (bottom - top) * uy;
}

function fbm(x: number, y: number, octaves = 4) {
  let total = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let norm = 0;

  for (let index = 0; index < octaves; index += 1) {
    total +=
      valueNoise(x * frequency + index * 17.3, y * frequency - index * 9.1) *
      amplitude;
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }

  return total / norm;
}

/** Ruido tipo cresta: dibuja grietas y vetas en lugar de manchas redondas. */
function ridgedNoise(x: number, y: number, octaves = 4) {
  let total = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let norm = 0;

  for (let index = 0; index < octaves; index += 1) {
    const sample = valueNoise(
      x * frequency + index * 5.7,
      y * frequency + index * 12.9,
    );
    const ridge = 1 - Math.abs(sample * 2 - 1);

    total += ridge * ridge * amplitude;
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.11;
  }

  return total / norm;
}

function createCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No hay contexto 2D para generar las texturas de las capas.");
  }

  return { canvas, context };
}

function createTextureFromBytes(
  size: number,
  sampler: (x: number, y: number) => RGB,
  colorSpace: THREE.ColorSpace,
) {
  const { canvas, context } = createCanvas(size);
  const image = context.createImageData(size, size);
  const data = image.data;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const color = sampler(x, y);
      const offset = (y * size + x) * 4;

      data[offset] = color[0];
      data[offset + 1] = color[1];
      data[offset + 2] = color[2];
      data[offset + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  // El giro de las corrientes se hace rotando la textura sobre su centro.
  texture.center.set(0.5, 0.5);
  texture.needsUpdate = true;

  return texture;
}

function createDiscTexture(
  size: number,
  sampler: DiscSampler,
  colorSpace: THREE.ColorSpace,
) {
  return createTextureFromBytes(
    size,
    (x, y) => {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;
      const dx = u * 2 - 1;
      const dy = v * 2 - 1;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      return sampler(u, v, radius, angle);
    },
    colorSpace,
  );
}

/* ------------------------------------------------------------------ */
/* Capas                                                              */
/* ------------------------------------------------------------------ */

const ROCK_SIZE = 384;
const CORE_SIZE = 384;
const CRUST_SIZE = 320;
const CRYSTAL_SIZE = 360;

/** Corteza: roca estratificada con grano mineral en el borde de la esfera. */
function crustAlbedo(u: number, v: number, radius: number): RGB {
  const x = u * 9;
  const y = v * 9;
  const base = fbm(x * 1.8 + 4.2, y * 1.8 - 1.6, 5);
  const grain = fbm(x * 13.5 + 3.1, y * 13.5 - 7.4, 3);
  const strata = 0.5 + 0.5 * Math.sin(radius * 150 + base * 9.4);
  const pores = smoothstep(0.62, 0.92, grain);

  let color = mix([74, 64, 56], [158, 144, 124], base);
  color = mix(color, [104, 82, 62], strata * 0.4);
  color = mix(color, [42, 36, 32], pores * 0.55);
  color = mix(color, [212, 200, 180], smoothstep(0.86, 1, grain) * 0.5);

  return color;
}

/** Brillo tenue en el filo exterior de la corteza, como un borde iluminado. */
function crustRimGlow(_u: number, _v: number, radius: number): RGB {
  // Solo el filo: si el brillo invadiera más radio teñiría medio grosor.
  if (radius > 1) return [0, 0, 0];

  const value = 190 * smoothstep(0.982, 1, radius);

  return [value * 0.85, value * 0.95, value];
}

/** Manto: roca irregular, vetas incandescentes y celdas de convección. */
function mantleAlbedo(u: number, v: number, radius: number, angle: number): RGB {
  const x = u * 7;
  const y = v * 7;
  const rock = fbm(x * 1.35, y * 1.35, 5);
  const warpX = fbm(x * 0.9 + 3.7, y * 0.9 + 8.2, 3);
  const warpY = fbm(x * 0.9 - 6.1, y * 0.9 + 1.4, 3);
  const cracks = ridgedNoise(
    x * 2.1 + warpX * 2.4 + 11.2,
    y * 2.1 + warpY * 2.4 - 4.6,
    4,
  );
  const vein = smoothstep(0.42, 0.72, cracks);
  const convection = 0.5 + 0.5 * Math.sin(angle * 3 + radius * 9 + warpX * 7.5);
  const grain = fbm(x * 6.5 + 21.3, y * 6.5 - 12.7, 3);

  let color = mix([40, 16, 10], [132, 48, 22], rock * 0.9 + grain * 0.1);
  color = mix(color, [168, 70, 28], convection * convection * 0.45);
  color = mix(color, [26, 9, 7], smoothstep(0.55, 0.95, grain) * 0.35);
  color = mix(color, [255, 126, 44], vein * 0.92);
  color = mix(color, [255, 222, 170], smoothstep(0.7, 0.95, vein) * 0.6);

  return color;
}

function mantleGlow(u: number, v: number, radius: number, angle: number): RGB {
  const x = u * 7;
  const y = v * 7;
  const rock = fbm(x * 1.35, y * 1.35, 5);
  const warpX = fbm(x * 0.9 + 3.7, y * 0.9 + 8.2, 3);
  const warpY = fbm(x * 0.9 - 6.1, y * 0.9 + 1.4, 3);
  const cracks = ridgedNoise(
    x * 2.1 + warpX * 2.4 + 11.2,
    y * 2.1 + warpY * 2.4 - 4.6,
    4,
  );
  const vein = smoothstep(0.38, 0.78, cracks);
  const convection = 0.5 + 0.5 * Math.sin(angle * 3 + radius * 9 + warpX * 7.5);
  // El manto profundo está más caliente que el que roza la corteza.
  const depth = 0.55 + 0.7 * (1 - clamp01(radius));
  const value = clamp01(vein * 1.25 + convection * 0.16 * rock + 0.03) * depth;

  return [255 * value, 205 * value * 0.85, 150 * value * 0.72];
}

/** Rugosidad del manto: la roca caliente es algo más lisa que la fría. */
function mantleRoughness(u: number, v: number): RGB {
  const value = 255 * (0.62 + 0.34 * fbm(u * 11 + 2.4, v * 11 - 6.8, 3));

  return [value, value, value];
}

/** Núcleo externo: metal fundido con remolinos y vetas de brillo. */
function outerCoreAlbedo(
  u: number,
  v: number,
  radius: number,
  angle: number,
): RGB {
  const x = u * 5.4;
  const y = v * 5.4;
  const turbulence = fbm(x * 1.5 + 4.1, y * 1.5 - 3.7, 4);
  const swirl =
    0.5 + 0.5 * Math.sin(angle * 2 + radius * 13 + turbulence * 6.1);
  const fine = fbm(x * 8.5 + 2.5, y * 8.5 + 6.1, 3);
  const streak = smoothstep(0.45, 0.92, swirl);

  let color = mix([56, 12, 8], [178, 58, 28], swirl);
  color = mix(color, [232, 112, 52], streak * 0.6);
  color = mix(color, [255, 204, 138], smoothstep(0.76, 0.98, swirl) * 0.5);
  color = mix(color, [22, 6, 5], smoothstep(0.62, 1, fine) * 0.45);

  return color;
}

function outerCoreGlow(
  u: number,
  v: number,
  radius: number,
  angle: number,
): RGB {
  const x = u * 5.4;
  const y = v * 5.4;
  const turbulence = fbm(x * 1.5 + 4.1, y * 1.5 - 3.7, 4);
  const swirl =
    0.5 + 0.5 * Math.sin(angle * 2 + radius * 13 + turbulence * 6.1);
  const fine = fbm(x * 8.5 + 2.5, y * 8.5 + 6.1, 3);
  // Cerca del núcleo interno el metal está más caliente.
  const depth = clamp01(0.5 + 0.85 * (1 - radius));
  const value =
    clamp01(smoothstep(0.38, 0.92, swirl) * 1.05 + fine * 0.15 + 0.04) * depth;

  return [255 * value, 178 * value * 0.86, 118 * value * 0.7];
}

function outerCoreRoughness(u: number, v: number): RGB {
  const value = 255 * (0.16 + 0.46 * fbm(u * 14 + 9.3, v * 14 - 2.1, 3));

  return [value, value, value];
}

/**
 * Núcleo interno: facetas de cristal metálico. Se construye un campo de altura
 * Voronoi (una altura por celda) y de ahí salen el mapa de normales, el color
 * dorado y el brillo de cada cara.
 */
function crystalMaps(size: number) {
  const cellCount = 58;
  const cellX = new Float32Array(cellCount);
  const cellY = new Float32Array(cellCount);
  const cellHeight = new Float32Array(cellCount);
  const cellTone = new Float32Array(cellCount);

  let seed = 20260917;
  const random = () => {
    seed = (seed * 16807) % 2147483647;

    return seed / 2147483647;
  };

  for (let index = 0; index < cellCount; index += 1) {
    cellX[index] = random();
    cellY[index] = random();
    cellHeight[index] = random();
    cellTone[index] = random();
  }

  const height = new Float32Array(size * size);
  const tone = new Float32Array(size * size);
  const edge = new Float32Array(size * size);
  const inside = new Uint8Array(size * size);

  for (let py = 0; py < size; py += 1) {
    const v = (py + 0.5) / size;
    const dy = v * 2 - 1;

    for (let px = 0; px < size; px += 1) {
      const u = (px + 0.5) / size;
      const dx = u * 2 - 1;
      const index = py * size + px;

      inside[index] = Math.sqrt(dx * dx + dy * dy) <= 1.02 ? 1 : 0;

      let nearest = Infinity;
      let second = Infinity;
      let nearestIndex = 0;

      for (let cell = 0; cell < cellCount; cell += 1) {
        const cx = u - cellX[cell];
        const cy = v - cellY[cell];
        const distance = Math.sqrt(cx * cx + cy * cy);

        if (distance < nearest) {
          second = nearest;
          nearest = distance;
          nearestIndex = cell;
        } else if (distance < second) {
          second = distance;
        }
      }

      height[index] = cellHeight[nearestIndex] * 0.75 - nearest * 0.22;
      tone[index] = cellTone[nearestIndex];
      edge[index] = smoothstep(0, 0.014, second - nearest);
    }
  }

  const map = createTextureFromBytes(
    size,
    (x, y) => {
      const index = y * size + x;

      if (!inside[index]) return [10, 8, 4];

      const grain = fbm((x / size) * 26, (y / size) * 26, 2);
      const glow = clamp01(height[index] + 0.18);

      let color = mix([92, 64, 14], [255, 214, 132], tone[index]);
      color = mix(color, [255, 238, 190], smoothstep(0.6, 0.96, glow) * 0.55);
      color = mix([24, 17, 6], color, edge[index]);
      color = mix(color, [38, 28, 10], smoothstep(0.62, 1, grain) * 0.25);

      return color;
    },
    THREE.SRGBColorSpace,
  );

  const emissiveMap = createTextureFromBytes(
    size,
    (x, y) => {
      const index = y * size + x;

      if (!inside[index]) return [0, 0, 0];

      const glow = clamp01(height[index] + 0.3);
      const value =
        255 *
        clamp01(glow * 0.95 + 0.34) *
        (0.45 + 0.55 * edge[index]) *
        (0.75 + 0.25 * tone[index]);

      return [value, value * 0.86, value * 0.58];
    },
    THREE.SRGBColorSpace,
  );

  const roughnessMap = createTextureFromBytes(
    size,
    (x, y) => {
      const index = y * size + x;
      const value =
        255 *
        (0.16 + 0.32 * (1 - tone[index]) + 0.16 * (1 - edge[index]));

      return [value, value, value];
    },
    THREE.NoColorSpace,
  );

  const normalMap = createTextureFromBytes(
    size,
    (x, y) => {
      const index = y * size + x;

      if (!inside[index]) return [128, 128, 255];

      const clampX = (value: number) => Math.min(size - 1, Math.max(0, value));
      const left = height[index - (x > 0 ? 1 : 0)];
      const right = height[clampX(x + 1) + y * size];
      const down = height[clampX(y - 1) * size + x];
      const up = height[clampX(y + 1) * size + x];
      const nx = (left - right) * 7.5;
      const ny = (down - up) * 7.5;
      const length = Math.sqrt(nx * nx + ny * ny + 1);

      return [
        (nx / length) * 127.5 + 127.5,
        (ny / length) * 127.5 + 127.5,
        (1 / length) * 127.5 + 127.5,
      ];
    },
    THREE.NoColorSpace,
  );

  return { map, emissiveMap, roughnessMap, normalMap };
}

/**
 * Entorno equirectangular mínimo para los metales. Sin él, `metalness` alto se
 * ve negro: solo quedarían los reflejos puntuales de las luces. Se resuelve con
 * un par de focos cálidos y un fondo frío muy tenue.
 */
function createMetalEnvironment() {
  const width = 256;
  const height = 128;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No hay contexto 2D para generar el entorno de los metales.");
  }

  const image = context.createImageData(width, height);
  const data = image.data;

  const spots = [
    { u: 0.16, v: 0.34, radius: 0.16, color: [255, 196, 128], gain: 1.15 },
    { u: 0.62, v: 0.26, radius: 0.12, color: [150, 196, 255], gain: 0.75 },
    { u: 0.86, v: 0.52, radius: 0.2, color: [255, 138, 72], gain: 0.9 },
    { u: 0.38, v: 0.74, radius: 0.26, color: [70, 96, 150], gain: 0.5 },
  ] as const;

  for (let y = 0; y < height; y += 1) {
    const v = (y + 0.5) / height;

    for (let x = 0; x < width; x += 1) {
      const u = (x + 0.5) / width;
      const band = Math.exp(-Math.pow((v - 0.46) / 0.2, 2)) * 0.18;
      let red = 4 + band * 30;
      let green = 6 + band * 26;
      let blue = 12 + band * 22;

      for (const spot of spots) {
        const rawU = Math.abs(u - spot.u);
        const du = Math.min(rawU, 1 - rawU) * 1.9;
        const dv = v - spot.v;
        const distance = Math.sqrt(du * du + dv * dv);
        const falloff =
          smoothstep(spot.radius, spot.radius * 0.15, distance) * spot.gain;

        red += spot.color[0] * falloff;
        green += spot.color[1] * falloff;
        blue += spot.color[2] * falloff;
      }

      const offset = (y * width + x) * 4;

      data[offset] = Math.min(255, red);
      data[offset + 1] = Math.min(255, green);
      data[offset + 2] = Math.min(255, blue);
      data[offset + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);

  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

/* ------------------------------------------------------------------ */
/* Ensamblaje                                                         */
/* ------------------------------------------------------------------ */

export type LayerVisuals = {
  /** Color de la cara de corte. */
  capMap: THREE.Texture;
  /** Mapa de emisión (grayscale o cálido), multiplicado por `emissive`. */
  capEmissiveMap: THREE.Texture;
  capRoughnessMap?: THREE.Texture;
  capNormalMap?: THREE.Texture;
  /** Texturas que giran con el tiempo (corrientes y remolinos). */
  spinning: THREE.Texture[];
  /** Radianes por segundo. 0 = estático. */
  spinSpeed: number;
  emissive: string;
  emissiveIdle: number;
  emissiveActive: number;
  roughness: number;
  metalness: number;
  envMap?: THREE.Texture;
  envMapIntensity: number;
};

export type LayerVisualSet = {
  layers: Record<LayerId, LayerVisuals>;
  environment: THREE.Texture;
  dispose: () => void;
};

export function createLayerVisuals(): LayerVisualSet {
  const crustMap = createDiscTexture(CRUST_SIZE, crustAlbedo, THREE.SRGBColorSpace);
  const crustGlow = createDiscTexture(
    CRUST_SIZE,
    crustRimGlow,
    THREE.SRGBColorSpace,
  );

  const mantleMap = createDiscTexture(
    ROCK_SIZE,
    mantleAlbedo,
    THREE.SRGBColorSpace,
  );
  const mantleEmissive = createDiscTexture(
    ROCK_SIZE,
    mantleGlow,
    THREE.SRGBColorSpace,
  );
  const mantleRough = createDiscTexture(
    ROCK_SIZE,
    mantleRoughness,
    THREE.NoColorSpace,
  );

  const outerMap = createDiscTexture(
    CORE_SIZE,
    outerCoreAlbedo,
    THREE.SRGBColorSpace,
  );
  const outerEmissive = createDiscTexture(
    CORE_SIZE,
    outerCoreGlow,
    THREE.SRGBColorSpace,
  );
  const outerRough = createDiscTexture(
    CORE_SIZE,
    outerCoreRoughness,
    THREE.NoColorSpace,
  );

  const crystal = crystalMaps(CRYSTAL_SIZE);
  const environment = createMetalEnvironment();

  const layers: Record<LayerId, LayerVisuals> = {
    corteza: {
      capMap: crustMap,
      capEmissiveMap: crustGlow,
      spinning: [],
      spinSpeed: 0,
      emissive: "#8fd4ff",
      emissiveIdle: 0.22,
      emissiveActive: 0.6,
      roughness: 0.94,
      metalness: 0.02,
      envMapIntensity: 0,
    },
    manto: {
      capMap: mantleMap,
      capEmissiveMap: mantleEmissive,
      capRoughnessMap: mantleRough,
      spinning: [mantleMap, mantleEmissive, mantleRough],
      spinSpeed: 0.045,
      emissive: "#ff9147",
      emissiveIdle: 0.3,
      emissiveActive: 1,
      roughness: 1,
      metalness: 0.06,
      envMapIntensity: 0,
    },
    "nucleo-externo": {
      capMap: outerMap,
      capEmissiveMap: outerEmissive,
      capRoughnessMap: outerRough,
      spinning: [outerMap, outerEmissive, outerRough],
      spinSpeed: 0.17,
      emissive: "#ff6a3a",
      emissiveIdle: 0.34,
      emissiveActive: 1.05,
      roughness: 1,
      metalness: 0.92,
      envMap: environment,
      envMapIntensity: 0.9,
    },
    "nucleo-interno": {
      capMap: crystal.map,
      capEmissiveMap: crystal.emissiveMap,
      capRoughnessMap: crystal.roughnessMap,
      capNormalMap: crystal.normalMap,
      spinning: [
        crystal.map,
        crystal.emissiveMap,
        crystal.roughnessMap,
        crystal.normalMap,
      ],
      spinSpeed: 0.07,
      emissive: "#ffd35c",
      emissiveIdle: 0.42,
      emissiveActive: 1.3,
      roughness: 1,
      metalness: 0.96,
      envMap: environment,
      envMapIntensity: 1.15,
    },
  };

  const textures = new Set<THREE.Texture>([
    crustMap,
    crustGlow,
    mantleMap,
    mantleEmissive,
    mantleRough,
    outerMap,
    outerEmissive,
    outerRough,
    crystal.map,
    crystal.emissiveMap,
    crystal.roughnessMap,
    crystal.normalMap,
    environment,
  ]);

  return {
    layers,
    environment,
    dispose: () => {
      textures.forEach((texture) => texture.dispose());
      textures.clear();
    },
  };
}
