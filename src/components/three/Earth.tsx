"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import Atmosphere from "@/components/three/Atmosphere";
import NightLights from "@/components/three/NightLights";
import { useEarthRotation } from "@/hooks/useEarthRotation";
import {
  CLOUDS_DRIFT_SPEED,
  CLOUDS_RADIUS,
  EARTH_TEXTURES,
  getEarthLayout,
} from "@/lib/three-config";

type EarthProps = {
  reducedMotion: boolean;
  onReady?: () => void;
};

const MAX_ANISOTROPY = 8;

/**
 * Planeta Tierra: superficie con mapa diurno, relieve, brillo oceánico, nubes y
 * luces nocturnas. El halo atmosférico no rota con el planeta.
 */
export default function Earth({ reducedMotion, onReady }: EarthProps) {
  const rotationRef = useEarthRotation({ enabled: !reducedMotion });
  const cloudsRef = useRef<THREE.Mesh>(null);
  const { size, viewport, gl } = useThree();

  const textures = useTexture({
    day: EARTH_TEXTURES.day,
    night: EARTH_TEXTURES.night,
    clouds: EARTH_TEXTURES.clouds,
    normal: EARTH_TEXTURES.normal,
    specular: EARTH_TEXTURES.specular,
  });

  const layout = useMemo(
    () => getEarthLayout(size.width, size.height, viewport.height),
    [size.width, size.height, viewport.height],
  );

  useMemo(() => {
    const anisotropy = Math.min(MAX_ANISOTROPY, gl.capabilities.getMaxAnisotropy());

    Object.values(textures).forEach((texture) => {
      texture.anisotropy = anisotropy;
    });

    // Mapas de color en sRGB; mapas de datos (normal, especular) lineales.
    textures.day.colorSpace = THREE.SRGBColorSpace;
    textures.night.colorSpace = THREE.SRGBColorSpace;
    textures.normal.colorSpace = THREE.NoColorSpace;
    textures.specular.colorSpace = THREE.NoColorSpace;
    textures.clouds.colorSpace = THREE.SRGBColorSpace;
  }, [textures, gl]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useFrame((_, delta) => {
    if (reducedMotion || !cloudsRef.current) return;
    cloudsRef.current.rotation.y += CLOUDS_DRIFT_SPEED * Math.min(delta, 0.05);
  });

  return (
    <group position={[0, layout.offsetY, 0]} scale={layout.scale}>
      <group ref={rotationRef}>
        <mesh>
          <sphereGeometry args={[1, 96, 96]} />
          <meshPhongMaterial
            map={textures.day}
            normalMap={textures.normal}
            specularMap={textures.specular}
            specular="#16344c"
            shininess={44}
          />
        </mesh>

        <NightLights map={textures.night} />

        <mesh ref={cloudsRef} scale={CLOUDS_RADIUS} renderOrder={2}>
          <sphereGeometry args={[1, 96, 96]} />
          {/* Las nubes están en el canal alfa de la textura: como `map` se
              respeta su forma, mientras que un `alphaMap` leería el verde
              (opaco en casi toda la imagen) y taparía el planeta. */}
          <meshPhongMaterial
            map={textures.clouds}
            color="#ffffff"
            transparent
            opacity={0.92}
            alphaTest={0.015}
            depthWrite={false}
            specular="#2a4a66"
            shininess={8}
          />
        </mesh>
      </group>

      <Atmosphere />
    </group>
  );
}
