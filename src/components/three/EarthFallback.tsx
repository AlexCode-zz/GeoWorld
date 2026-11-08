/**
 * Alternativa visual sin WebGL (y estado de carga): una esfera estática con la
 * textura diurna, sombra interior y halo azul. Nunca sustituye a la escena 3D
 * cuando WebGL está disponible.
 */
export default function EarthFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 aspect-square w-[min(78vw,32vh)] -translate-x-1/2 -translate-y-1/2 top-[34%] sm:w-[min(54vw,52vh)] sm:top-[40%]">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(63, 141, 255, 0.35), rgba(63, 141, 255, 0.1) 48%, transparent 72%)",
            transform: "scale(1.4)",
          }}
        />
        <div
          aria-hidden
          className="relative h-full w-full rounded-full bg-black bg-cover bg-center"
          style={{
            backgroundImage: "url('/textures/earth-day.jpg')",
            boxShadow:
              "inset -26px -16px 60px 12px rgba(0, 0, 0, 0.92), inset 8px 8px 34px rgba(120, 180, 255, 0.18), 0 0 90px rgba(63, 141, 255, 0.22)",
          }}
        />
      </div>

      <p className="sr-only">
        Vista estática de la Tierra. Tu navegador no puede mostrar la escena 3D
        interactiva.
      </p>
    </div>
  );
}
