import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BuchstaBiene",
    short_name: "BuchstaBiene",
    description:
      "Finde alle Wörter, die du aus den Buchstaben zusammen setzen kannst.",
    start_url: "/spielen/heute",
    display: "standalone",
    background_color: "#facc15",
    theme_color: "#0c0a09",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
