import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AQUAVANT — Intelligence in Motion",
  description: "An immersive marine technology concept exploring autonomous systems, purposeful design and a more responsive future on the water.",
  openGraph: {
    title: "AQUAVANT — Intelligence in Motion",
    description: "A new perspective on marine response.",
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
