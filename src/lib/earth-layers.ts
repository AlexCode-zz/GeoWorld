/**
 * Datos de las capas internas de la Tierra. Se comparten entre las tarjetas, el
 * panel de detalle y el modelo 3D.
 *
 * `radius` es la fracción del radio terrestre que ocupa cada capa en la escena.
 * La corteza va algo engrosada para que se distinga a tamaño de pantalla.
 */
export type LayerId = "corteza" | "manto" | "nucleo-externo" | "nucleo-interno";

export type EarthLayer = {
  id: LayerId;
  name: string;
  summary: string;
  detail: string;
  /** Color representativo de la capa. */
  color: string;
  depth: string;
  state: string;
  temperature: string;
  composition: string;
  /** Radios interior y exterior, en unidades de la escena (radio terrestre = 1). */
  radius: [number, number];
};

export const EARTH_LAYERS: EarthLayer[] = [
  {
    id: "corteza",
    name: "Corteza",
    summary:
      "La capa más externa: sólida, relativamente delgada y formada por rocas. Es donde vivimos.",
    detail:
      "Bajo los océanos mide unos 7 km y bajo los continentes llega a 70 km. Está fragmentada en placas tectónicas que se desplazan lentamente sobre el manto.",
    color: "#4fb3ff",
    depth: "0 – 35 km",
    state: "Sólida",
    temperature: "0 – 1.000 °C",
    composition: "Rocas de silicatos",
    radius: [0.94, 1],
  },
  {
    id: "manto",
    name: "Manto",
    summary:
      "Rocas muy calientes bajo la corteza. Sus movimientos lentos influyen en las placas tectónicas.",
    detail:
      "Aunque es roca sólida, a las presiones del interior fluye como un material plástico muy viscoso. Esas corrientes de convección arrastran las placas y alimentan los volcanes.",
    color: "#ff8a3d",
    depth: "35 – 2.890 km",
    state: "Sólido, con flujo lento",
    temperature: "1.000 – 3.700 °C",
    composition: "Silicatos de Mg y Fe",
    radius: [0.54, 0.94],
  },
  {
    id: "nucleo-externo",
    name: "Núcleo externo",
    summary:
      "Hierro y níquel líquidos. Sus movimientos ayudan a generar el campo magnético terrestre.",
    detail:
      "El metal fundido gira en remolinos y actúa como una dinamo: genera el campo magnético que desvía el viento solar y protege la vida en la superficie.",
    color: "#ff4d4d",
    depth: "2.890 – 5.150 km",
    state: "Líquido",
    temperature: "4.000 – 5.000 °C",
    composition: "Hierro y níquel",
    radius: [0.19, 0.54],
  },
  {
    id: "nucleo-interno",
    name: "Núcleo interno",
    summary:
      "La parte más profunda: hierro y níquel sólidos a temperaturas extremadamente elevadas.",
    detail:
      "Está a una temperatura parecida a la superficie del Sol, pero la presión enorme lo mantiene sólido. Crece poco a poco a medida que el planeta se enfría.",
    color: "#ffd447",
    depth: "5.150 – 6.371 km",
    state: "Sólido",
    temperature: "≈ 5.400 °C",
    composition: "Hierro y níquel",
    radius: [0, 0.19],
  },
];

export function getEarthLayer(id: LayerId): EarthLayer {
  return EARTH_LAYERS.find((layer) => layer.id === id) ?? EARTH_LAYERS[0];
}
