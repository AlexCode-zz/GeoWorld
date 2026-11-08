"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import CutawayFallback from "@/components/three/CutawayFallback";
import type { LayerId } from "@/lib/earth-layers";
import { detectWebGL } from "@/lib/webgl";

const CutawayScene = dynamic(() => import("@/components/three/CutawayScene"), {
  ssr: false,
});

type WebGLStatus = "pending" | "supported" | "unsupported";

type CutawayCanvasProps = {
  selected: LayerId;
  onSelect: (id: LayerId) => void;
};

/**
 * Monta el modelo 3D solo en el cliente y solo si hay WebGL. Mientras carga
 * muestra un esquema de capas que se desvanece al primer render.
 */
export default function CutawayCanvas({
  selected,
  onSelect,
}: CutawayCanvasProps) {
  const [status, setStatus] = useState<WebGLStatus>("pending");
  const [sceneReady, setSceneReady] = useState(false);

  const handleReady = useCallback(() => setSceneReady(true), []);

  useEffect(() => {
    setStatus(detectWebGL() ? "supported" : "unsupported");
  }, []);

  return (
    <div className="absolute inset-0">
      {status === "supported" ? (
        <CutawayScene
          selected={selected}
          onSelect={onSelect}
          onReady={handleReady}
        />
      ) : null}

      <div
        aria-hidden={sceneReady}
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out ${
          sceneReady ? "opacity-0" : "opacity-100"
        }`}
      >
        <CutawayFallback />
      </div>
    </div>
  );
}
