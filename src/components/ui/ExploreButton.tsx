"use client";

import Link from "next/link";

type ExploreButtonProps = {
  href: string;
  /** Cuando es `false` el destino aún no existe y el botón lo anuncia. */
  available: boolean;
  className?: string;
};

const BASE_CLASSES =
  "group inline-flex items-center gap-2.5 rounded-full border px-6 py-3 text-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

export default function ExploreButton({
  href,
  available,
  className = "",
}: ExploreButtonProps) {
  const content = (
    <>
      <span>Explorar Capas</span>
      {!available ? (
        <span className="rounded-full border border-electric/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-electric/90">
          pronto
        </span>
      ) : null}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </>
  );

  if (!available) {
    return (
      <button
        type="button"
        aria-disabled="true"
        title="Disponible en la próxima fase"
        className={`${BASE_CLASSES} cursor-default border-white/15 bg-white/[0.03] text-white/75 hover:bg-white/[0.06] ${className}`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`${BASE_CLASSES} border-electric/45 bg-electric/10 text-white hover:border-electric/80 hover:bg-electric/20 ${className}`}
    >
      {content}
    </Link>
  );
}
