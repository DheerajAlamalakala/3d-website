import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VITAL/FORM — The Human Body, Reimagined",
  description: "An immersive, futuristic exploration of human anatomy, biological systems and the living architecture beneath the surface.",
  openGraph: {
    title: "VITAL/FORM — The Human Body, Reimagined",
    description: "Explore the human body through an immersive interactive anatomy experience.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
