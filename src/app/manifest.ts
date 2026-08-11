import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArcadeMint — Original browser games",
    short_name: "ArcadeMint",
    description: "Twenty-nine original browser games in English and Simplified Chinese.",
    start_url: "/en",
    display: "standalone",
    background_color: "#0b1020",
    theme_color: "#7c5cff",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
