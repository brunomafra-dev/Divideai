import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SplitMate",
    short_name: "SplitMate",
    description: "Organize e divida gastos entre amigos, casais e grupos",
    start_url: "/",
    display: "standalone",
    background_color: "#16A34A",
    theme_color: "#16A34A",
    icons: [
      {
        src: "/logo/splitmate-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/splitmate-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/splitmate-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo/splitmate-icon-48.png",
        sizes: "48x48",
        type: "image/png",
      },
    ],
  };
}

