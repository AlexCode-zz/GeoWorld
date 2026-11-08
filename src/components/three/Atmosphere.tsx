"use client";

import { useMemo } from "react";
import * as THREE from "three";

import {
  ATMOSPHERE_COLOR,
  ATMOSPHERE_RADIUS,
  SUN_POSITION,
} from "@/lib/three-config";

const vertexShader = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = cameraPosition - worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSunDirection;
  uniform float uIntensity;
  uniform float uPower;

  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(vViewDirection);

    // Fresnel: el halo crece hacia el borde visible de la esfera.
    float rim = pow(1.0 - abs(dot(normal, viewDirection)), uPower);
    // Se intensifica del lado iluminado y se apaga en el terminador.
    float sun = smoothstep(-0.5, 0.8, dot(normal, normalize(uSunDirection)));

    float alpha = rim * uIntensity * mix(0.22, 1.0, sun);
    if (alpha < 0.002) discard;

    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`;

/**
 * Halo atmosférico azul. Es una esfera algo mayor que la Tierra renderizada por
 * su cara interior (BackSide) con blending aditivo.
 */
export default function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(ATMOSPHERE_COLOR) },
          uSunDirection: {
            value: new THREE.Vector3(...SUN_POSITION).normalize(),
          },
          uIntensity: { value: 1.25 },
          uPower: { value: 3.4 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  return (
    <mesh scale={ATMOSPHERE_RADIUS} renderOrder={3}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
