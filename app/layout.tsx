import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");

  return {
    title: "PIPAA — Jugador profesional de PUBG y creador",
    description: "Sitio oficial de PIPAA: jugador profesional de PUBG, integrante de la Selección Argentina y creador de Panza Army.",
    metadataBase: host ? new URL(`${protocol}://${host}`) : undefined,
    openGraph: {
      title: "PIPAA — Competir es parte del juego",
      description: "Jugador profesional de PUBG · Selección Argentina · Panza Army",
      type: "website",
      locale: "es_AR",
      images: [{ url: "/og.png", width: 1731, height: 905, alt: "PIPAA — jugador profesional y creador argentino" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "PIPAA — Jugador profesional de PUBG",
      description: "Selección Argentina · Creador de Panza Army",
      images: ["/og.png"],
    },
    icons: { icon: "/pipa-avatar.webp", shortcut: "/pipa-avatar.webp" },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
