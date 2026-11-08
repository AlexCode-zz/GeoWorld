"use client";

import Link from "next/link";

type ExploreButtonProps = {
  href: string;
  className?: string;
};

const BASE_CLASSES =
  "group inline-flex items-center gap-2.5 rounded-full border px-6 py-3 text-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

export default function ExploreButton({
  href,
  className = "",
}: ExploreButtonProps) {
  return (
    <Link
      href={href}
      className={`${BASE_CLASSES} border-electric/45 bg-electric/10 text-white hover:border-electric/80 hover:bg-electric/20 ${className}`}
    >
      <span>Explorar Capas</span>
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
