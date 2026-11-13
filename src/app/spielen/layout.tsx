import type { Metadata } from "next";
import type { ReactNode } from "react";

// Daily games, solutions, and highscores remain playable but do not fill the search index.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function GameLayout({ children }: { children: ReactNode }) {
  return children;
}
