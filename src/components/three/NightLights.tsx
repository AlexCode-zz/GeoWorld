"use client";

import { useMemo } from "react";
import * as THREE from "three";

import { NIGHT_RADIUS, SUN_POSITION } from "@/lib/three-config";

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uSunDirection;
  uniform vec3 uTint;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vec3 texel = texture2D(uMap, vUv).rgb;

    // De la textura nocturna solo interesa el brillo de las ciudades: el azul
    // tenue de océanos y continentes se descarta para no teñir el planeta.
    float brightness = max(texel.r, max(texel.g, texel.b));
    float cities = smoothstep(0.12, 0.55, brightness);

    // Máscara del terminador: 1 en la cara nocturna, 0 en la iluminada.
    float lit = dot(normalize(vWorldNormal), uSunDirection);
    float night = 1.0 - smoothstep(-0.32, 0.12, lit);

    gl_FragColor = vec4(uTint * cities * night * uOpacity, 1.0);
  }
`;

/**
 * Luces nocturnas de las ciudades. Se suman solo sobre la cara que el sol no
 * ilumina, con un degradado suave en el terminador.
 */
export default function NightLights({ map }: { map: THREE.Texture }) {
  const uniforms = useMemo(
    () => ({
      uMap: { value: map },
      uSunDirection: { value: new THREE.Vector3(...SUN_POSITION).normalize() },
      uTint: { value: new THREE.Color("#dbe9ff") },
      uOpacity: { value: 0.95 },
    }),
    [map],
  );

  return (
    <mesh scale={NIGHT_RADIUS} renderOrder={1}>
      <sphereGeometry args={[1, 96, 96]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
