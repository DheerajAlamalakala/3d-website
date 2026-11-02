
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AQUAVANT — A new way to navigate",
  description:
    "A cinematic, scroll-driven 3D marine technology experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
