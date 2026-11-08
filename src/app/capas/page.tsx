import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import LayersExplorer from "@/components/sections/LayersExplorer";

export const metadata: Metadata = {
  title: "Las Capas de la Tierra · GeoWorld",
  description:
    "Explora la corteza, el manto y los núcleos externo e interno de la Tierra en un modelo 3D interactivo.",
};

export default function LayersPage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <LayersExplorer />
      </main>
    </>
  );
}
