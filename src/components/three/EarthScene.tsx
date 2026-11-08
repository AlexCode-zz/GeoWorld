"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import Earth from "@/components/three/Earth";
import StarField from "@/components/three/StarField";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_POSITION,
  DPR_RANGE,
  SUN_POSITION,
} from "@/lib/three-config";

type EarthSceneProps = {
  onReady?: () => void;
};

/**
 * Escena 3D completa. Se carga solo en el cliente (ver `EarthCanvas`), por eso
 * puede leer `prefers-reduced-motion` y usar WebGL sin problemas de SSR.
 */
export default function EarthScene({ onReady }: EarthSceneProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Canvas
      camera={{
        fov: CAMERA_FOV,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
        position: CAMERA_POSITION,
      }}
      dpr={DPR_RANGE}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      className="cursor-grab touch-pan-y select-none active:cursor-grabbing"
    >
      <ambientLight intensity={0.22} color="#7fa4ff" />
      <directionalLight position={SUN_POSITION} intensity={1.7} color="#ffffff" />
      <directionalLight
        position={[-5, -1.5, -3.5]}
        intensity={0.4}
        color="#2f6bff"
      />

      <Suspense fallback={null}>
        <StarField reducedMotion={reducedMotion} />
        <Earth reducedMotion={reducedMotion} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
