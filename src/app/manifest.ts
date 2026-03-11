import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DivideAI",
    short_name: "DivideAI",
    description: "Organize e divida gastos entre amigos, casais e grupos",
    start_url: "/",
    display: "standalone",
    background_color: "#16A34A",
    theme_color: "#16A34A",
    icons: [
      {
        src: "/logo/divideai-icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo/divideai-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
