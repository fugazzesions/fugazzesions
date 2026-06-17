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
  title: {
    default: "Fugazzesions — Pizza, Patín y Punto",
    template: "%s · Fugazzesions",
  },
  description:
    "Comunidad de patín en Argentina. Sesiones, clases de quad e inline, y la tradición de cerrar todo con pizza.",
  keywords: ['patín', 'quad', 'inline', 'rollers', 'fugazzesions', 'argentina', 'comunidad'],
  authors: [{ name: 'Fugazzesions' }],
  openGraph: {
    title: 'Fugazzesions — Pizza, Patín y Punto',
    description:
      'Comunidad de patín en Argentina. Sesiones, clases de quad e inline, y la tradición de cerrar todo con pizza.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'Fugazzesions',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fugazzesions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fugazzesions — Pizza, Patín y Punto',
    description: 'Comunidad de patín en Argentina.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
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