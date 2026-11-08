"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LAYERS_ROUTE } from "@/lib/site";

const NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: LAYERS_ROUTE, label: "Capas" },
];

export default function Navbar() {
  const pathname = usePathname();

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
        </Link>

        <ul className="flex items-center gap-7 text-[13px] sm:gap-9 sm:text-sm">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative inline-block rounded-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/60 focus-visible:ring-offset-4 focus-visible:ring-offset-black ${
                    isActive ? "text-white" : "text-white/55 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={`absolute -bottom-2 left-0 h-px w-full bg-electric/80 transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
