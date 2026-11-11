# GeoWorld · 

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
