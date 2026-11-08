"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import EarthFallback from "@/components/three/EarthFallback";

const EarthScene = dynamic(() => import("@/components/three/EarthScene"), {
  ssr: false,
});

type WebGLStatus = "pending" | "supported" | "unsupported";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2") || canvas.getContext("webgl");

    return Boolean(window.WebGLRenderingContext && context);
  } catch {
    return false;
  }
}

/**
 * Monta la escena 3D solo en el cliente y solo si hay WebGL. Mientras carga
 * muestra `EarthFallback`, que se desvanece al primer render del planeta.
 */
export default function EarthCanvas() {
  const [status, setStatus] = useState<WebGLStatus>("pending");
  const [sceneReady, setSceneReady] = useState(false);

  const handleReady = useCallback(() => setSceneReady(true), []);

  useEffect(() => {
    setStatus(detectWebGL() ? "supported" : "unsupported");
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {status === "supported" ? <EarthScene onReady={handleReady} /> : null}

      <div
        aria-hidden={sceneReady}
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out ${
          sceneReady ? "opacity-0" : "opacity-100"
        }`}
      >
        <EarthFallback />
      </div>
    </div>
  );
}
