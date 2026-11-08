/**
 * Constantes de la escena 3D y cálculo del encuadre del planeta.
 *
 * Todas las medidas de la esfera se expresan en unidades de three.js con la
 * geometría en radio 1: la escala del grupo define el tamaño final en pantalla.
 */
export const EARTH_TEXTURES = {
  day: "/textures/earth-day.jpg",
  night: "/textures/earth-night.png",
  clouds: "/textures/earth-clouds.png",
  normal: "/textures/earth-normal.jpg",
  specular: "/textures/earth-specular.jpg",
} as const;

export const EARTH_RADIUS = 1;
export const NIGHT_RADIUS = 1.0015;
export const CLOUDS_RADIUS = 1.014;
export const ATMOSPHERE_RADIUS = 1.17;

/** Velocidad de giro propio del planeta en radianes por segundo. */
export const EARTH_ROTATION_SPEED = 0.045;
/** Deriva adicional de las nubes para separarlas de la superficie. */
export const CLOUDS_DRIFT_SPEED = 0.012;
/** Sensibilidad del arrastre: radianes por píxel recorrido. */
export const DRAG_SENSITIVITY = 0.0055;
/** Deriva del fondo estelar en radianes por segundo. */
export const STAR_DRIFT_SPEED = 0.008;

export const CAMERA_FOV = 42;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 120;
export const CAMERA_POSITION: [number, number, number] = [0, 0, 6.6];

export const SUN_POSITION: [number, number, number] = [4.6, 2.4, 3.4];

/** Rango de device pixel ratio: evita renderizar a 3x en pantallas densas. */
export const DPR_RANGE: [number, number] = [1, 1.75];

export const ATMOSPHERE_COLOR = "#3f8dff";

export type StarLayer = {
  count: number;
  size: number;
  opacity: number;
  color: string;
  /** Semiancho y semialto del volumen donde se reparten las estrellas. */
  area: [number, number];
  /** Rango de profundidad (eje Z). */
  depth: [number, number];
};

export const STAR_LAYERS: StarLayer[] = [
  {
    count: 1600,
    size: 0.05,
    opacity: 0.55,
    color: "#9dc0ff",
    area: [20, 12],
    depth: [-26, -10],
  },
  {
    count: 700,
    size: 0.075,
    opacity: 0.85,
    color: "#ffffff",
    area: [12, 8],
    depth: [-10, -4],
  },
  {
    count: 180,
    size: 0.12,
    opacity: 1,
    color: "#d8e7ff",
    area: [9, 6],
    depth: [-8, -2],
  },
];

export const GLOW_STAR_COUNT = 14;

const COMPACT_BREAKPOINT = 768;

export type EarthLayout = {
  /** Escala del grupo: el diámetro en unidades es `scale * 2`. */
  scale: number;
  /** Desplazamiento vertical en unidades para dejar aire al texto inferior. */
  offsetY: number;
};

/**
 * Calcula escala y posición del planeta a partir del tamaño del lienzo.
 * `viewportHeight` es la altura visible en unidades del mundo a z = 0.
 */
export function getEarthLayout(
  width: number,
  height: number,
  viewportHeight: number,
): EarthLayout {
  if (!width || !height || !viewportHeight) {
    return { scale: 1.4, offsetY: 0.5 };
  }

  const compact = width < COMPACT_BREAKPOINT;
  const diameter = compact
    ? Math.min(width * 0.78, height * 0.33)
    : Math.min(width * 0.55, height * 0.52);
  const centerY = compact ? 0.34 : 0.4;

  const unitsPerPixel = viewportHeight / height;

  return {
    scale: (diameter / 2) * unitsPerPixel,
    offsetY: (0.5 - centerY) * viewportHeight,
  };
}
