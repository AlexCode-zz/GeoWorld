import Link from "next/link";

import { LAYERS_AVAILABLE, LAYERS_ROUTE, SITE_NAME } from "@/lib/site";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-black/25 backdrop-blur-md">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-12"
      >
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/60 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
        >
          <svg
            aria-hidden
            viewBox="0 0 32 32"
            className="h-7 w-7 shrink-0"
            fill="none"
          >
            <circle
              cx="16"
              cy="16"
              r="8.4"
              className="fill-electric/10 stroke-electric"
              strokeWidth="1.1"
            />
            <ellipse
              cx="16"
              cy="16"
              rx="13.6"
              ry="4.9"
              transform="rotate(-28 16 16)"
              className="stroke-white/30"
              strokeWidth="0.9"
            />
            <circle cx="27.2" cy="9.8" r="1.5" className="fill-electric" />
          </svg>
          <span className="text-[15px] font-medium tracking-[-0.01em] text-white">
            Geo<span className="text-white/55">World</span>
          </span>
          <span className="sr-only">{SITE_NAME}</span>
        </Link>

        <ul className="flex items-center gap-7 text-[13px] sm:gap-9 sm:text-sm">
          <li>
            <Link
              href="/"
              aria-current="page"
              className="relative inline-block text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/60 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              Inicio
              <span
                aria-hidden
                className="absolute -bottom-2 left-0 h-px w-full bg-electric/80"
              />
            </Link>
          </li>

          <li>
            {LAYERS_AVAILABLE ? (
              <Link
                href={LAYERS_ROUTE}
                className="text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/60 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
              >
                Capas
              </Link>
            ) : (
              <span
                aria-disabled="true"
                title="Próximamente"
                className="inline-flex cursor-default items-center gap-1.5 text-white/35"
              >
                Capas
                <span
                  aria-hidden
                  className="h-1 w-1 rounded-full bg-electric/70"
                />
                <span className="sr-only">(próximamente)</span>
              </span>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
