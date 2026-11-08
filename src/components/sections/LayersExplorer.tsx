"use client";

import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import CutawayCanvas from "@/components/three/CutawayCanvas";
import {
  EARTH_LAYERS,
  getEarthLayer,
  type LayerId,
} from "@/lib/earth-layers";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function LayersExplorer() {
  const [selectedId, setSelectedId] = useState<LayerId>("corteza");
  const reducedMotion = useReducedMotion();
  const selected = getEarthLayer(selectedId);

  return (
    <section className="relative isolate overflow-hidden bg-black">
      {/* Ambiente: la misma paleta azul de la home, con un rescoldo cálido del núcleo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-56 left-1/2 h-[620px] w-[900px] -translate-x-1/2 opacity-70 blur-[130px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(63, 141, 255, 0.18), transparent)",
          }}
        />
        <div
          className="absolute -bottom-40 right-0 h-[420px] w-[520px] opacity-40 blur-[130px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255, 122, 26, 0.22), transparent)",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1500px] px-5 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-12 lg:pb-28 lg:pt-36">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-x-16 lg:gap-y-12">
          <header className="lg:col-start-1 lg:row-start-1">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-electric/90">
                Estructura interna
              </p>
              <h1 className="mt-4 max-w-[16ch] text-balance text-[clamp(2.1rem,4.8vw,3.9rem)] font-light leading-[0.98] tracking-[-0.035em] text-white">
                Las Capas de la Tierra
              </h1>
              <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-white/60 sm:text-base">
                La Tierra no es una roca maciza: bajo nuestros pies hay cuatro
                capas concéntricas de roca y metal, cada una con su propia
                temperatura, estado y papel en el planeta.
              </p>
              <p className="mt-6 max-w-[44ch] font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-white/30">
                Selecciona una capa para destacarla · arrastra el modelo para
                girarlo
              </p>
            </motion.div>
          </header>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
          >
            <div
              className="relative h-[clamp(300px,48vh,520px)] w-full overflow-hidden rounded-[28px] border border-white/[0.08]"
              style={{
                background:
                  "radial-gradient(120% 120% at 50% 0%, rgba(18, 48, 104, 0.42), rgba(0, 0, 0, 0.9) 62%)",
              }}
            >
              <CutawayCanvas selected={selectedId} onSelect={setSelectedId} />

              <ul className="pointer-events-none absolute bottom-5 left-5 flex flex-col gap-2">
                {EARTH_LAYERS.map((layer) => {
                  const isActive = layer.id === selectedId;

                  return (
                    <li
                      key={layer.id}
                      className={`flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                        isActive ? "text-white" : "text-white/40"
                      }`}
                    >
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full transition-shadow duration-300"
                        style={{
                          background: layer.color,
                          boxShadow: isActive
                            ? `0 0 10px ${layer.color}`
                            : "none",
                        }}
                      />
                      {layer.name}
                    </li>
                  );
                })}
              </ul>

              <p className="pointer-events-none absolute bottom-5 right-5 hidden font-mono text-[10px] uppercase tracking-[0.16em] text-white/25 sm:block">
                Arrastra para girar
              </p>
            </div>

            <div
              aria-live="polite"
              className="mt-4 min-h-[186px] rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:min-h-[168px] sm:p-6"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selected.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: EASE }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: selected.color,
                        boxShadow: `0 0 12px ${selected.color}99`,
                      }}
                    />
                    <h2
                      className="font-mono text-[10px] uppercase tracking-[0.24em]"
                      style={{ color: selected.color }}
                    >
                      {selected.name}
                    </h2>
                    <span className="ml-auto font-mono text-[10px] tracking-[0.08em] text-white/40">
                      {selected.depth}
                    </span>
                  </div>

                  <p className="mt-3 text-[13px] leading-relaxed text-white/65">
                    {selected.detail}
                  </p>

                  <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-white/[0.07] pt-4 text-[11px] sm:grid-cols-3">
                    {[
                      ["Estado", selected.state],
                      ["Temperatura", selected.temperature],
                      ["Composición", selected.composition],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="font-mono uppercase tracking-[0.16em] text-white/30">
                          {label}
                        </dt>
                        <dd className="mt-1 text-white/70">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="lg:col-start-1 lg:row-start-2">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
              Las cuatro capas
            </p>

            <ul className="flex flex-col gap-3">
              {EARTH_LAYERS.map((layer, index) => {
                const isSelected = layer.id === selectedId;

                return (
                  <motion.li
                    key={layer.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.15 + index * 0.07,
                      ease: EASE,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(layer.id)}
                      aria-pressed={isSelected}
                      className={`group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                        isSelected
                          ? "border-[var(--layer-border)] bg-[var(--layer-bg)]"
                          : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.045]"
                      }`}
                      style={
                        {
                          "--layer-border": `${layer.color}66`,
                          "--layer-bg": `${layer.color}0f`,
                        } as CSSProperties
                      }
                    >
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-[2px] transition-opacity duration-300"
                        style={{
                          background: layer.color,
                          opacity: isSelected ? 1 : 0,
                        }}
                      />

                      <div className="flex items-baseline justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{
                              background: layer.color,
                              boxShadow: `0 0 10px ${layer.color}80`,
                            }}
                          />
                          <h2 className="text-[15px] font-medium text-white">
                            {layer.name}
                          </h2>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                          {layer.depth}
                        </span>
                      </div>

                      <p className="mt-2 text-[13px] leading-relaxed text-white/55">
                        {layer.summary}
                      </p>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
