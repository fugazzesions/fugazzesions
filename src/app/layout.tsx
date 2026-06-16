import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fugazzesions — Pizza, Patín y Punto",
  description:
    "Comunidad de patín en Argentina. Sesiones, clases de quad e inline, y la tradición de cerrar todo con pizza.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${caveat.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}