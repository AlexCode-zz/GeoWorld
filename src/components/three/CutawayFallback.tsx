/**
 * Alternativa sin WebGL (y estado de carga) del corte transversal: círculos
 * concéntricos con los colores de cada capa. Nunca sustituye al modelo 3D
 * cuando WebGL está disponible.
 */
import { EARTH_LAYERS } from "@/lib/earth-layers";

export default function CutawayFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative aspect-square w-[min(64%,320px)]">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${EARTH_LAYERS[3].color} 0 19%, ${EARTH_LAYERS[2].color} 19% 54%, ${EARTH_LAYERS[1].color} 54% 94%, ${EARTH_LAYERS[0].color} 94% 100%)`,
            boxShadow: "0 0 90px rgba(255, 122, 26, 0.22)",
          }}
        />
        {/* El sector retirado deja ver el corte, igual que en el modelo 3D. */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg 270deg, #000000 270deg 360deg)",
          }}
        />

        <p className="sr-only">
          Esquema plano de las capas de la Tierra. Tu navegador no puede mostrar
          el modelo 3D interactivo.
        </p>
      </div>
    </div>
  );
}
