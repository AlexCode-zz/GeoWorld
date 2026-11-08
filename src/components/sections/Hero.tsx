"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import ScrollIndicator from "@/components/sections/ScrollIndicator";
import EarthCanvas from "@/components/three/EarthCanvas";
import ExploreButton from "@/components/ui/ExploreButton";
import { LAYERS_AVAILABLE, LAYERS_ROUTE } from "@/lib/site";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: EASE },
  },
};

export default function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative isolate flex min-h-svh w-full flex-col overflow-hidden bg-black">
      <EarthCanvas />

      {/* Oscurece la mitad inferior para que el texto respire sobre el planeta. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[64%]"
        style={{
          background:
            "linear-gradient(to top, #000000 0%, rgba(0, 0, 0, 0.94) 26%, rgba(0, 0, 0, 0.6) 58%, transparent 100%)",
        }}
      />
      {/* Velo frío superior: sugiere atmósfera sin competir con el planeta. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(70% 50% at 50% 16%, rgba(20, 52, 110, 0.25), transparent 72%)",
        }}
      />

      <div className="relative z-10 mt-auto w-full px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12">
        <motion.div
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
          variants={container}
          className="mx-auto w-full max-w-[1500px] border-t border-white/[0.09] pt-7 sm:pt-9"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <motion.h1
              variants={item}
              className="max-w-[20ch] text-balance text-[clamp(2.35rem,6.2vw,5.2rem)] font-light leading-[0.95] tracking-[-0.04em] text-white lg:max-w-[24ch]"
            >
              Nuestro Planeta Tierra
            </motion.h1>

            <motion.div variants={item} className="w-full max-w-sm lg:pb-1">
              <p className="text-[15px] leading-relaxed text-white/60 sm:text-base">
                Un mundo increíble, lleno de vida, capas y misterios por
                descubrir.
              </p>
              <ExploreButton
                href={LAYERS_ROUTE}
                available={LAYERS_AVAILABLE}
                className="mt-6"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  );
}
