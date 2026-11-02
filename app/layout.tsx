import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORM—FIELD | Independent Digital Studio",
  description: "An experimental digital studio building immersive worlds, generative systems and interactive experiences.",
  openGraph: {
    title: "FORM—FIELD | Independent Digital Studio",
    description: "A living digital experience shaped by code, design, light and motion.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
