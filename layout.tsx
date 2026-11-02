import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORM·FIELD — Worlds in Motion",
  description: "An independent creative technology studio making immersive digital worlds, interactive experiences and generative systems.",
  openGraph: {
    title: "FORM·FIELD — Worlds in Motion",
    description: "A digital world in constant motion. Design, technology and imagination become one.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
