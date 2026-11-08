"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  GLOW_STAR_COUNT,
  STAR_DRIFT_SPEED,
  STAR_LAYERS,
  type StarLayer,
} from "@/lib/three-config";

type StarFieldProps = {
  reducedMotion: boolean;
};

type GlowStar = {
  position: [number, number, number];
  scale: [number, number, number];
  opacity: number;
};

/** Sprite radial generado en runtime: evita cargar un asset extra. */
function createGlowTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;

  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) return null;

  const center = size / 2;
  const gradient = context.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center,
  );
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.22, "rgba(255, 255, 255, 0.65)");
  gradient.addColorStop(0.5, "rgba(196, 222, 255, 0.18)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createStarPositions(layer: StarLayer): Float32Array {
  const positions = new Float32Array(layer.count * 3);
  const [areaX, areaY] = layer.area;
  const [depthNear, depthFar] = layer.depth;

  for (let index = 0; index < layer.count; index += 1) {
    positions[index * 3] = (Math.random() * 2 - 1) * areaX;
    positions[index * 3 + 1] = (Math.random() * 2 - 1) * areaY;
    positions[index * 3 + 2] =
      depthNear + Math.random() * (depthFar - depthNear);
  }

  return positions;
}

function StarPoints({
  layer,
  texture,
}: {
  layer: StarLayer;
  texture: THREE.Texture | null;
}) {
  const positions = useMemo(() => createStarPositions(layer), [layer]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={layer.size}
        sizeAttenuation
        transparent
        opacity={layer.opacity}
        color={layer.color}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/**
 * Fondo espacial: tres capas de estrellas a distintas profundidades más unas
 * pocas estrellas con brillo. Todo rota muy despacio para dar paralaje.
 */
export default function StarField({ reducedMotion }: StarFieldProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowTexture = useMemo(() => createGlowTexture(), []);

  useEffect(() => {
    return () => {
      glowTexture?.dispose();
    };
  }, [glowTexture]);

  const glowStars = useMemo<GlowStar[]>(() => {
    return Array.from({ length: GLOW_STAR_COUNT }, () => {
      const size = 0.28 + Math.random() * 0.55;
      return {
        position: [
          (Math.random() * 2 - 1) * 11,
          (Math.random() * 2 - 1) * 7,
          -9 + Math.random() * 6,
        ],
        scale: [size, size, 1],
        opacity: 0.22 + Math.random() * 0.32,
      };
    });
  }, []);

  useFrame((state, delta) => {
    if (reducedMotion || !groupRef.current) return;

    const step = Math.min(delta, 0.05);
    groupRef.current.rotation.y += STAR_DRIFT_SPEED * step;
    groupRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.05) * 0.012;
  });

  return (
    <group ref={groupRef}>
      {STAR_LAYERS.map((layer, index) => (
        <StarPoints key={index} layer={layer} texture={glowTexture} />
      ))}

      {glowStars.map((star, index) => (
        <sprite
          key={`glow-${index}`}
          position={star.position}
          scale={star.scale}
        >
          <spriteMaterial
            map={glowTexture}
            transparent
            opacity={star.opacity}
            color="#cfe4ff"
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}
