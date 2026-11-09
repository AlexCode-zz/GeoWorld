# GeoWorld · Fases 1 y 2

Proyecto educativo interactivo sobre el planeta Tierra. La home está
protagonizada por un globo terráqueo 3D con texturas reales, nubes, luces
nocturnas y un halo atmosférico azul, sobre un fondo espacial. La página
`/capas` explica la estructura interna del planeta con un modelo 3D en corte
transversal.

## Stack

| Tecnología        | Uso                                |
| ----------------- | ---------------------------------- |
| Next.js 16        | Framework (App Router)             |
| React 19          | Componentes                        |
| TypeScript        | Tipado estricto                    |
| Three.js          | Motor 3D                           |
| React Three Fiber | Escena 3D declarativa              |
| @react-three/drei | Carga de texturas                  |
| Tailwind CSS 4    | Estilos y responsive               |
| Framer Motion     | Animaciones de entrada y selección |

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Compilar y servir la versión de producción:

```bash
npm run build
npm run start
```

Comprobación de tipos:

```bash
npx tsc --noEmit
```

## Rutas

| Ruta     | Contenido                                      |
| -------- | ---------------------------------------------- |
| `/`      | Home con el planeta 3D                         |
| `/capas` | Capas internas: tarjetas + corte transversal   |

El navbar marca la ruta activa con `usePathname` y `aria-current="page"`.

## Estructura

```text
public/
└── textures/              # Mapas de la Tierra (día, noche, nubes, normal, especular)

src/
├── app/
│   ├── layout.tsx         # Metadatos, fuentes y shell oscuro
│   ├── page.tsx           # Home: Navbar + Hero
│   ├── icon.svg           # Favicon con el emblema de GeoWorld
│   ├── capas/page.tsx     # Página de las capas internas
│   └── globals.css        # Tokens de color y estilos base
├── components/
│   ├── layout/
│   │   └── Navbar.tsx     # Barra fija con la ruta activa
│   ├── sections/
│   │   ├── Hero.tsx       # Composición, textos y entrada animada
│   │   ├── ScrollIndicator.tsx
│   │   └── LayersExplorer.tsx  # Dos columnas, tarjetas y ficha de la capa
│   ├── three/
│   │   ├── EarthCanvas.tsx      # Carga diferida, WebGL y fallback
│   │   ├── EarthScene.tsx       # Canvas, luces y composición
│   │   ├── Earth.tsx            # Superficie, nubes y luces nocturnas
│   │   ├── NightLights.tsx      # Luces de ciudad limitadas al lado oscuro
│   │   ├── Atmosphere.tsx       # Halo azul (shader fresnel aditivo)
│   │   ├── StarField.tsx        # Estrellas, brillos y deriva
│   │   ├── EarthFallback.tsx    # Alternativa sin WebGL (home)
│   │   ├── CutawayCanvas.tsx    # Carga diferida del corte transversal
│   │   ├── CutawayScene.tsx     # Esferas recortadas, caras de corte y selección
│   │   └── CutawayFallback.tsx  # Alternativa sin WebGL (capas)
│   └── ui/
│       └── ExploreButton.tsx
├── hooks/
│   ├── useEarthRotation.ts        # Giro automático + arrastre con inercia
│   └── usePrefersReducedMotion.ts
└── lib/
    ├── three-config.ts   # Constantes, texturas y encuadre responsive
    ├── earth-layers.ts   # Datos de las cuatro capas y sus radios
    ├── webgl.ts          # Detección de WebGL compartida
    └── site.ts           # Nombre y ruta de capas
```

## Página de capas

La columna izquierda reúne el título, la introducción y cuatro tarjetas
(corteza, manto, núcleo externo y núcleo interno). La derecha mantiene el modelo
3D fijo mientras se recorre la lista.

- Pasar el cursor por una tarjeta la resalta; al pulsarla se convierte en la
  capa activa (`aria-pressed`).
- La capa activa se ilumina en el modelo y las demás se atenúan con una
  transición suavizada por frame.
- La ficha bajo el modelo muestra profundidad, estado, temperatura, composición
  y una explicación ampliada, con un fundido entre capas.
- También se puede pulsar directamente cada capa en el modelo, tanto con ratón
  como con el dedo.

El modelo se construye con `SphereGeometry` recortada: a cada esfera se le quita
una cuña de 90° y el hueco se cierra con dos medias coronas (`RingGeometry`) que
muestran el grosor de la capa; el núcleo interno usa un semicírculo macizo. La
corteza conserva la textura diurna con las coordenadas UV reasignadas para que
los continentes no se deformen al recortarla. Su grosor está exagerado en la
escena (6 % del radio) para que se distinga en pantalla.

## Interacción

- Home: el planeta gira solo de forma lenta y continua.
- En ambas páginas se puede arrastrar con el ratón o el dedo: horizontal para
  girar, vertical para inclinar. Al soltar conserva algo de inercia.
- En móvil el arrastre vertical sigue desplazando la página
  (`touch-action: pan-y`), solo se captura el gesto horizontal.

## Rendimiento y accesibilidad

- Las escenas 3D se cargan con `next/dynamic` y `ssr: false`: no se ejecutan en
  el servidor y no bloquean el primer pintado.
- `dpr` limitado a `[1, 1.75]` para no renderizar a 3x en pantallas densas.
- Texturas de 1024–2048 px (~1,6 MB en total) y geometrías moderadas.
- Se respeta `prefers-reduced-motion`: sin giro automático, sin deriva de
  estrellas y sin animaciones de entrada. El arrastre manual sigue funcionando.
- Si WebGL no está disponible hay alternativas estáticas: una esfera con la
  textura diurna en la home y un esquema de círculos concéntricos en `/capas`.
  Nunca sustituyen a la escena 3D cuando el navegador la soporta.
- Enfoque de teclado visible en tarjetas, enlaces y botones.

## Texturas

Los mapas de `public/textures` son material de **dominio público** de
[NASA Visible Earth](https://visibleearth.nasa.gov/), así que se pueden usar y
modificar sin pedir permiso (la NASA no patrocina el proyecto):

- `earth-day.jpg` — Blue Marble Next Generation (julio de 2004), con el tono
  ajustado.
- `earth-night.png` — luces nocturnas de las ciudades (DMSP), recortadas por el
  shader al lado oscuro.
- `earth-clouds.png` — nubes de julio de 2004; su forma vive en el canal alfa,
  por eso se usa como `map` transparente y no como `alphaMap`.
- `earth-normal.jpg` — relieve derivado del mapa diurno (Sobel suavizado).
- `earth-specular.jpg` — máscara de océanos y hielo generada a partir del color
  del mapa diurno.

Créditos completos y licencias de las fuentes y dependencias:
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Las capas internas no usan imágenes: sus caras de corte llevan texturas
procedurales generadas en el cliente desde `src/lib/layer-textures.ts` (ruido
determinista, sin descargas): roca estratificada en la corteza, roca con vetas
incandescentes y celdas de convección en el manto, metal fundido con remolinos
en el núcleo externo y facetas de cristal dorado en el núcleo interno. Las
texturas se ajustan al disco de cada capa y giran sobre su centro para animar
las corrientes, sin tocar la geometría ni la interacción.

Las fuentes se cargan con `next/font`, así que no hay archivos en
`public/fonts`.
