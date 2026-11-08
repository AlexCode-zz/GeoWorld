"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function ScrollIndicator() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-3">
      <span className="relative block h-9 w-px overflow-hidden bg-white/15">
        {reducedMotion ? null : (
          <motion.span
            className="absolute left-0 top-0 block h-3 w-px bg-electric"
            animate={{ y: [-14, 36], opacity: [0, 1, 0] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            }}
          />
        )}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        Desplaza para explorar
      </span>
    </div>
  );
}
