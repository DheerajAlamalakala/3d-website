import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AQUAVANT — The Ocean Is Our Next Frontier",
  description: "An immersive autonomous marine systems experience. Explore the AQUAVANT platform, mission concepts and intelligent technology for the water.",
  openGraph: {
    title: "AQUAVANT — Intelligence in Motion",
    description: "A new perspective on autonomous marine systems, perception and response.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
