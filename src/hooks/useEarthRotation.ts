"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { MathUtils } from "three";

import {
  DRAG_SENSITIVITY,
  EARTH_ROTATION_SPEED,
} from "@/lib/three-config";

type EarthRotationOptions = {
  /** Giro automático. Se desactiva con `prefers-reduced-motion`. */
  enabled?: boolean;
  /** Velocidad angular en radianes por segundo. */
  speed?: number;
};

const MAX_TILT = 0.45;
const INERTIA_DECAY = 0.86;
const MAX_STEP = 0.05;

/**
 * Devuelve la ref del grupo que rota y conecta el arrastre del puntero sobre el
 * lienzo. El arrastre horizontal gira el planeta; el vertical lo inclina.
 * Se debe usar dentro del `<Canvas>`.
 */
export function useEarthRotation({
  enabled = true,
  speed = EARTH_ROTATION_SPEED,
}: EarthRotationOptions = {}) {
  const groupRef = useRef<Group>(null);
  const gl = useThree((state) => state.gl);
  const drag = useRef({ active: false, lastX: 0, lastY: 0, velocity: 0 });

  useEffect(() => {
    const canvas = gl.domElement;
    const state = drag.current;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      state.active = true;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      state.velocity = 0;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!state.active) return;

      const group = groupRef.current;
      const deltaX = event.clientX - state.lastX;
      const deltaY = event.clientY - state.lastY;
      state.lastX = event.clientX;
      state.lastY = event.clientY;

      if (!group) return;

      state.velocity = deltaX * DRAG_SENSITIVITY;
      group.rotation.y += state.velocity;
      group.rotation.x = MathUtils.clamp(
        group.rotation.x + deltaY * DRAG_SENSITIVITY * 0.5,
        -MAX_TILT,
        MAX_TILT,
      );
    };

    const endDrag = () => {
      state.active = false;
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const state = drag.current;
    if (state.active) return;

    const step = Math.min(delta, MAX_STEP);

    // Inercia tras soltar: se frena de forma independiente de los FPS.
    if (Math.abs(state.velocity) > 0.0002) {
      group.rotation.y += state.velocity;
      state.velocity *= Math.pow(INERTIA_DECAY, step * 60);
      return;
    }

    if (enabled) {
      group.rotation.y += speed * step;
    }
  });

  return groupRef;
}
