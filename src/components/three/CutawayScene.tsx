"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import StarField from "@/components/three/StarField";
import { useEarthRotation } from "@/hooks/useEarthRotation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  EARTH_LAYERS,
  type EarthLayer,
  type LayerId,
} from "@/lib/earth-layers";
import {
  CAMERA_FAR,
  CAMERA_NEAR,
  DPR_RANGE,
  EARTH_TEXTURES,
} from "@/lib/three-config";

/**
 * Corte transversal: se retira una cuña de 90° del frente de cada esfera y se
 * cierra el hueco con dos medias coronas que muestran el grosor de la capa.
 */
const CUT_ANGLE = Math.PI / 2;
const CUT_PHI_START = Math.PI / 2 + CUT_ANGLE / 2;
const CUT_PHI_LENGTH = Math.PI * 2 - CUT_ANGLE;
/** Planos de corte: azimut de cada cara expuesta. */
const CUT_FACE_ANGLES = [
  Math.PI / 2 - CUT_ANGLE / 2,
  Math.PI / 2 + CUT_ANGLE / 2,
];

const SEGMENTS = 128;
const CAMERA_POSITION: [number, number, number] = [0, 0, 3.5];
const CAMERA_FOV = 38;
const SURFACE_LAYER: LayerId = "corteza";

type LayerShellProps = {
  layer: EarthLayer;
  selected: boolean;
  onSelect: (id: LayerId) => void;
  surfaceTexture?: THREE.Texture;
};

function LayerShell({
  layer,
  selected,
  onSelect,
  surfaceTexture,
}: LayerShellProps) {
  const [innerRadius, outerRadius] = layer.radius;

  // La esfera exterior de la corteza conserva las coordenadas de la textura:
  // al recortar la cuña hay que reasignar la U para que los continentes no se
  // deformen.
  const shellGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(
      outerRadius,
      SEGMENTS,
      64,
      CUT_PHI_START,
      CUT_PHI_LENGTH,
    );

    if (surfaceTexture) {
      const uv = geometry.attributes.uv;

      for (let index = 0; index < uv.count; index += 1) {
        uv.setX(
          index,
          (CUT_PHI_START + uv.getX(index) * CUT_PHI_LENGTH) / (Math.PI * 2),
        );
      }

      uv.needsUpdate = true;
    }

    return geometry;
  }, [outerRadius, surfaceTexture]);

  const capGeometry = useMemo(() => {
    const thetaStart = -Math.PI / 2;

    // El núcleo interno es macizo: su cara de corte es un semicírculo.
    return innerRadius === 0
      ? new THREE.CircleGeometry(outerRadius, SEGMENTS, thetaStart, Math.PI)
      : new THREE.RingGeometry(
          innerRadius,
          outerRadius,
          SEGMENTS,
          1,
          thetaStart,
          Math.PI,
        );
  }, [innerRadius, outerRadius]);

  const materials = useMemo(() => {
    const color = new THREE.Color(layer.color);
    const shell = new THREE.MeshStandardMaterial({
      color: surfaceTexture ? new THREE.Color("#ffffff") : color.clone(),
      map: surfaceTexture ?? null,
      emissive: color.clone(),
      emissiveIntensity: 0.12,
      roughness: surfaceTexture ? 0.9 : 0.58,
      metalness: surfaceTexture ? 0.04 : 0.14,
    });
    const cap = new THREE.MeshStandardMaterial({
      color: color.clone(),
      emissive: color.clone(),
      emissiveIntensity: 0.2,
      roughness: 0.5,
      metalness: 0.12,
      side: THREE.DoubleSide,
    });

    return { color, shell, cap };
  }, [layer.color, surfaceTexture]);

  const targets = useMemo(
    () => ({
      shellActive: surfaceTexture
        ? new THREE.Color("#ffffff")
        : materials.color.clone(),
      shellIdle: surfaceTexture
        ? new THREE.Color("#7f8b98")
        : materials.color.clone().multiplyScalar(0.45),
      capActive: materials.color.clone(),
      capIdle: materials.color.clone().multiplyScalar(0.5),
    }),
    [materials.color, surfaceTexture],
  );

  useEffect(() => {
    return () => {
      shellGeometry.dispose();
      capGeometry.dispose();
      materials.shell.dispose();
      materials.cap.dispose();
    };
  }, [shellGeometry, capGeometry, materials]);

  useFrame((_, delta) => {
    const step = 1 - Math.exp(-8 * Math.min(delta, 0.05));
    const emissive = selected ? 0.85 : 0.14;

    materials.shell.color.lerp(
      selected ? targets.shellActive : targets.shellIdle,
      step,
    );
    materials.shell.emissiveIntensity +=
      (emissive - materials.shell.emissiveIntensity) * step;

    materials.cap.color.lerp(
      selected ? targets.capActive : targets.capIdle,
      step,
    );
    materials.cap.emissiveIntensity +=
      (emissive - materials.cap.emissiveIntensity) * step;
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(layer.id);
  };

  return (
    <group>
      <mesh
        geometry={shellGeometry}
        material={materials.shell}
        onClick={handleClick}
      />

      {CUT_FACE_ANGLES.map((angle) => (
        <mesh
          key={angle}
          geometry={capGeometry}
          material={materials.cap}
          rotation={[0, Math.PI + angle, 0]}
          onClick={handleClick}
        />
      ))}
    </group>
  );
}

type CutawayModelProps = {
  selected: LayerId;
  onSelect: (id: LayerId) => void;
  onReady?: () => void;
};

function CutawayModel({ selected, onSelect, onReady }: CutawayModelProps) {
  const rotationRef = useEarthRotation({ enabled: false });
  const surfaceTexture = useTexture(EARTH_TEXTURES.day);

  useMemo(() => {
    surfaceTexture.wrapS = THREE.RepeatWrapping;
    surfaceTexture.colorSpace = THREE.SRGBColorSpace;
  }, [surfaceTexture]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <group ref={rotationRef}>
      {EARTH_LAYERS.map((layer) => (
        <LayerShell
          key={layer.id}
          layer={layer}
          selected={layer.id === selected}
          onSelect={onSelect}
          surfaceTexture={
            layer.id === SURFACE_LAYER ? surfaceTexture : undefined
          }
        />
      ))}
    </group>
  );
}

type CutawaySceneProps = {
  selected: LayerId;
  onSelect: (id: LayerId) => void;
  onReady?: () => void;
};

/**
 * Escena del corte transversal. Se carga solo en el cliente (ver
 * `CutawayCanvas`) y comparte estrellas y arrastre con la home.
 */
export default function CutawayScene({
  selected,
  onSelect,
  onReady,
}: CutawaySceneProps) {
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
      <ambientLight intensity={0.85} color="#dfe9ff" />
      <directionalLight position={[3.4, 2.8, 4.2]} intensity={2.4} />
      <directionalLight
        position={[-4, -1.4, -3]}
        intensity={0.9}
        color="#2f6bff"
      />

      <Suspense fallback={null}>
        <StarField reducedMotion={reducedMotion} />
        <CutawayModel
          selected={selected}
          onSelect={onSelect}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  );
}
