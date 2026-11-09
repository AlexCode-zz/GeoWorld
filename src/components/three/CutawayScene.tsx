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
  createLayerVisuals,
  type LayerVisuals,
} from "@/lib/layer-textures";
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
const MAX_ANISOTROPY = 8;

type LayerShellProps = {
  layer: EarthLayer;
  selected: boolean;
  onSelect: (id: LayerId) => void;
  visuals: LayerVisuals;
  animate: boolean;
  surfaceTexture?: THREE.Texture;
  surfaceNormal?: THREE.Texture;
};

function LayerShell({
  layer,
  selected,
  onSelect,
  visuals,
  animate,
  surfaceTexture,
  surfaceNormal,
}: LayerShellProps) {
  const [innerRadius, outerRadius] = layer.radius;

  // La esfera exterior de la corteza conserva las coordenadas de la textura:
  // al recortar la cuña hay que reasignar la U para que los continentes no se
  // deformen. El mapa de normales comparte esas UV, así que el relieve queda
  // alineado con los continentes.
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
    // La corteza lleva el mapa diurno y su relieve; el resto de esferas queda
    // oculto tras las caras de corte, así que mantienen color sólido.
    const shell = new THREE.MeshStandardMaterial({
      color: surfaceTexture ? new THREE.Color("#ffffff") : color.clone(),
      map: surfaceTexture ?? null,
      normalMap: surfaceTexture ? (surfaceNormal ?? null) : null,
      normalScale: new THREE.Vector2(0.85, 0.85),
      emissive: surfaceTexture ? new THREE.Color("#1d4a74") : color.clone(),
      emissiveIntensity: 0.12,
      roughness: surfaceTexture ? 0.94 : 0.62,
      metalness: 0,
    });

    // Las caras de corte usan texturas procedurales: roca, metal fundido y
    // cristal. El color base blanco deja que la textura mande y la selección
    // solo cambia el brillo (blanco → gris).
    const cap = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffffff"),
      map: visuals.capMap,
      emissive: new THREE.Color(visuals.emissive),
      emissiveMap: visuals.capEmissiveMap,
      emissiveIntensity: visuals.emissiveIdle,
      roughness: visuals.roughness,
      roughnessMap: visuals.capRoughnessMap ?? null,
      metalness: visuals.metalness,
      normalMap: visuals.capNormalMap ?? null,
      normalScale: new THREE.Vector2(1, 1),
      envMap: visuals.envMap ?? null,
      envMapIntensity: visuals.envMapIntensity,
      side: THREE.DoubleSide,
    });

    return { color, shell, cap };
  }, [layer.color, surfaceTexture, surfaceNormal, visuals]);

  const targets = useMemo(
    () => ({
      shellActive: surfaceTexture
        ? new THREE.Color("#ffffff")
        : materials.color.clone(),
      shellIdle: surfaceTexture
        ? new THREE.Color("#7f8b98")
        : materials.color.clone().multiplyScalar(0.45),
      shellEmissiveActive: surfaceTexture ? 0.32 : 0.85,
      shellEmissiveIdle: 0.12,
      capActive: new THREE.Color("#ffffff"),
      capIdle: new THREE.Color("#6b6b6b"),
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

    materials.shell.color.lerp(
      selected ? targets.shellActive : targets.shellIdle,
      step,
    );
    materials.shell.emissiveIntensity +=
      ((selected ? targets.shellEmissiveActive : targets.shellEmissiveIdle) -
        materials.shell.emissiveIntensity) *
      step;

    materials.cap.color.lerp(
      selected ? targets.capActive : targets.capIdle,
      step,
    );
    materials.cap.emissiveIntensity +=
      ((selected ? visuals.emissiveActive : visuals.emissiveIdle) -
        materials.cap.emissiveIntensity) *
      step;

    // Corrientes de convección y remolinos de metal: giran alrededor del
    // centro del disco, así que no alteran la geometría ni la distribución.
    if (!animate || visuals.spinSpeed === 0) return;

    const spin = visuals.spinSpeed * Math.min(delta, 0.05);

    visuals.spinning.forEach((texture) => {
      texture.rotation += spin;
    });
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
  reducedMotion: boolean;
  onReady?: () => void;
};

function CutawayModel({
  selected,
  onSelect,
  reducedMotion,
  onReady,
}: CutawayModelProps) {
  const rotationRef = useEarthRotation({ enabled: false });
  const { day, normal } = useTexture({
    day: EARTH_TEXTURES.day,
    normal: EARTH_TEXTURES.normal,
  });
  const visuals = useMemo(() => createLayerVisuals(), []);

  useMemo(() => {
    day.wrapS = THREE.RepeatWrapping;
    day.colorSpace = THREE.SRGBColorSpace;
    normal.colorSpace = THREE.NoColorSpace;
  }, [day, normal]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    return () => visuals.dispose();
  }, [visuals]);

  return (
    <group ref={rotationRef}>
      {EARTH_LAYERS.map((layer) => (
        <LayerShell
          key={layer.id}
          layer={layer}
          selected={layer.id === selected}
          onSelect={onSelect}
          visuals={visuals.layers[layer.id]}
          animate={!reducedMotion}
          surfaceTexture={layer.id === SURFACE_LAYER ? day : undefined}
          surfaceNormal={layer.id === SURFACE_LAYER ? normal : undefined}
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
          reducedMotion={reducedMotion}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  );
}
