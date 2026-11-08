# GeoWorld · Fase 1

Página de inicio de **GeoWorld**, un proyecto educativo interactivo sobre el
planeta Tierra. La home está protagonizada por un globo terráqueo 3D con
texturas reales, nubes, luces nocturnas y un halo atmosférico azul, sobre un
fondo espacial con estrellas en distintas profundidades.

> Fase 1 incluye únicamente la página de inicio. La página de las capas de la
> Tierra pertenece a la Fase 2; la navegación ya está preparada para enlazarla.

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
| Framer Motion     | Animaciones de entrada y scroll    |

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
│   └── globals.css        # Tokens de color y estilos base
├── components/
│   ├── layout/
│   │   └── Navbar.tsx     # Barra fija, transparente y con bordes sutiles
│   ├── sections/
│   │   ├── Hero.tsx       # Composición, textos y entrada animada
│   │   └── ScrollIndicator.tsx
│   ├── three/
│   │   ├── EarthCanvas.tsx   # Carga diferida, detección de WebGL y fallback
│   │   ├── EarthScene.tsx    # Canvas, luces y composición de la escena
│   │   ├── Earth.tsx         # Superficie, nubes y luces nocturnas
│   │   ├── Atmosphere.tsx    # Halo azul (shader fresnel aditivo)
│   │   ├── StarField.tsx     # Estrellas, brillos y deriva de profundidad
│   │   └── EarthFallback.tsx # Alternativa estática sin WebGL
│   └── ui/
│       └── ExploreButton.tsx
├── hooks/
│   ├── useEarthRotation.ts        # Giro automático + arrastre con inercia
│   └── usePrefersReducedMotion.ts
└── lib/
    ├── three-config.ts   # Constantes, texturas y encuadre responsive
    └── site.ts           # Rutas y disponibilidad de "Capas"
```

## Interacción

- El planeta gira solo de forma lenta y continua.
- Se puede arrastrar con el ratón o el dedo: horizontal para girarlo, vertical
  para inclinarlo ligeramente. Al soltar conserva algo de inercia.
- En móvil el arrastre vertical sigue desplazando la página
  (`touch-action: pan-y`), solo se captura el gesto horizontal.

## Rendimiento y accesibilidad

- La escena 3D se carga con `next/dynamic` y `ssr: false`: no se ejecuta en el
  servidor y no bloquea el primer pintado.
- `dpr` limitado a `[1, 1.75]` para no renderizar a 3x en pantallas densas.
- Texturas de 1024–2048 px (~1,6 MB en total) y geometrías moderadas.
- Se respeta `prefers-reduced-motion`: sin giro automático, sin deriva de
  estrellas y sin animaciones de entrada. El arrastre manual sigue funcionando.
- Si WebGL no está disponible, se muestra una esfera estática como alternativa
  visual; nunca sustituye a la escena 3D cuando el navegador la soporta.
- Enfoque de teclado visible en todos los elementos interactivos.

## Texturas

Los mapas de `public/textures` provienen de *NASA Visible Earth* y se
distribuyen con los ejemplos de [three.js](https://github.com/mrdoob/three.js)
(repositorio MIT):

- `earth-day.jpg` — mapa diurno (Blue Marble)
- `earth-night.png` — luces nocturnas
- `earth-clouds.png` — nubes (usado como `alphaMap`)
- `earth-normal.jpg` — relieve
- `earth-specular.jpg` — brillo de océanos

Las fuentes se cargan con `next/font`, así que no hay archivos en
`public/fonts`.

## Fase 2: capas de la Tierra

La navegación ya apunta a la futura ruta `/capas` a través de una única bandera:

```ts
// src/lib/site.ts
export const LAYERS_AVAILABLE = false;
```

Mientras es `false`, el enlace del navbar y el botón del hero se muestran como
"No disponible / pronto" en lugar de romper con un 404. Al crear la página en
`src/app/capas/page.tsx`, basta con cambiar la bandera a `true`.
