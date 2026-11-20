import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const siteUrl = (process.env.SITE_URL || "https://pipaa.store").replace(/\/$/, "");
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION || "";
const gaMeasurementId = process.env.GA_MEASUREMENT_ID || process.env.VITE_GA_ID || "";

const identityGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#pipa`,
      name: "Leonardo Rafael Ruppel",
      alternateName: ["PIPAA", "Pipa", "Pipa_ARG"],
      description: "Streamer argentino, jugador profesional de PUBG y creador de la comunidad Panza Army; también comparte contenido variado.",
      image: `${siteUrl}/pipaa-studio.webp`,
      url: `${siteUrl}/`,
      nationality: { "@type": "Country", name: "Argentina" },
      jobTitle: ["Jugador profesional de PUBG", "Streamer", "Creador de contenido"],
      knowsAbout: ["PUBG: Battlegrounds", "Esports", "Streaming", "Gaming competitivo"],
      award: "5.º puesto mundial con Argentina — PUBG Nations Cup 2026",
      sameAs: [
        "https://www.twitch.tv/pipa_arg",
        "https://kick.com/pipa_arg",
        "https://discord.gg/rgzZ3Kv",
        "https://www.youtube.com/@PIPAArg",
        "https://www.tiktok.com/@pipa_arg",
        "https://x.com/Pipa_arg",
        "https://www.instagram.com/rafa.ruppel",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "PIPAA",
      alternateName: "Pipa_ARG",
      url: `${siteUrl}/`,
      inLanguage: "es-AR",
      about: { "@id": `${siteUrl}/#pipa` },
    },
  ],
};

const routePages: Record<string, { label: string; title: string; description: string }> = {
  comandos: {
    label: "Tienda",
    title: "Tienda y comandos del stream | PIPAA (Pipa_ARG)",
    description: "Dónde comprar para participar en el directo de PIPAA: Dixper, WeezyX, puntos del canal de Twitch y código de creador PIPAA.",
  },
  directo: {
    label: "Directo",
    title: "PIPAA en vivo: directo de PUBG y variedad | Pipa_ARG",
    description: "Mirá los directos de PIPAA en Kick y Twitch: PUBG, contenido variado, multichat y la comunidad Panza Army.",
  },
  videos: {
    label: "Videos",
    title: "Videos de PIPAA: PUBG, partidas y momentos | Pipa_ARG",
    description: "Mirá los videos recientes de PIPAA en YouTube: partidas de PUBG, retos y momentos de sus directos.",
  },
  perfil: {
    label: "Perfil",
    title: "PIPAA: trayectoria en PUBG, Argentina y setup | Pipa_ARG",
    description: "Trayectoria en esports de PUBG, Selección Argentina PNC y setup Dual PC completo de PIPAA.",
  },
  legales: {
    label: "Avisos legales",
    title: "Avisos Legales y Privacidad · PIPAA",
    description: "Aviso legal, Política de Privacidad (Ley 25.326 · AAIP), Cookies y Defensa del Consumidor (Ley 24.240) en Argentina.",
  },
};

function graphForRoute(route?: string) {
  if (!route || !routePages[route]) return identityGraph;
  const meta = routePages[route];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/${route}/#webpage`,
        url: `${siteUrl}/${route}/`,
        name: meta.title,
        description: meta.description,
        inLanguage: "es-AR",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: "PIPAA",
          url: `${siteUrl}/`,
        },
        about: { "@id": `${siteUrl}/#pipa` },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: `${siteUrl}/` },
            { "@type": "ListItem", position: 2, name: meta.label, item: `${siteUrl}/${route}/` },
          ],
        },
      },
    ],
  };
}

function seoFiles() {
  return {
    name: "pipa-seo",
    transformIndexHtml(html: string, ctx: { path?: string }) {
      const route = ctx.path?.match(/\/(comandos|directo|videos|perfil|legales)(?:\/|$)/)?.[1];
      const pageUrl = route ? `${siteUrl}/${route}/` : `${siteUrl}/`;
      const canonicalBlock = `<link rel="canonical" href="${pageUrl}" />\n    <meta property="og:url" content="${pageUrl}" />\n    <link rel="alternate" hreflang="es-AR" href="${pageUrl}" />`;
      const activeGraph = graphForRoute(route);
      const structuredData = `<script type="application/ld+json">${JSON.stringify(activeGraph)}</script>`;

      const googleVerificationTag = googleVerification
        ? `<meta name="google-site-verification" content="${googleVerification}" />\n    `
        : "";

      const googleAnalyticsTag = gaMeasurementId
        ? `<!-- Google Tag (gtag.js) -->\n    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}"></script>\n    <script>\n      window.dataLayer = window.dataLayer || [];\n      function gtag(){dataLayer.push(arguments);}\n      gtag('js', new Date());\n      gtag('config', '${gaMeasurementId}');\n    </script>\n    `
        : "";

      const fullSeoRuntime = `${googleVerificationTag}${googleAnalyticsTag}${canonicalBlock}\n    ${structuredData}`;

      return html
        .replace("<!-- SEO_RUNTIME -->", fullSeoRuntime)
        .replace(/(['"])(?:\.{1,2}\/)?og-v3\.jpg(['"])/g, `$1${siteUrl}/og-v3.jpg$2`);
    },
    closeBundle() {
      const dist = resolve("dist");
      const sitemapPath = resolve(dist, "sitemap.xml");

      const robotsContent = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /api/",
        "Disallow: /chat/",
        "",
        "User-agent: Googlebot",
        "Allow: /",
        "Disallow: /api/",
        "Disallow: /chat/",
        "",
        "User-agent: Googlebot-Image",
        "Allow: /",
        "",
        "User-agent: Bingbot",
        "Allow: /",
        "Disallow: /api/",
        "Disallow: /chat/",
        "",
        `Sitemap: ${siteUrl}/sitemap.xml`,
        "",
      ].join("\n");

      writeFileSync(resolve(dist, "robots.txt"), robotsContent, "utf8");

      const subRoutes = Object.entries(routePages)
        .map(
          ([route]) =>
            `  <url>\n    <loc>${siteUrl}/${route}/</loc>\n  </url>\n`,
        )
        .join("");

      writeFileSync(
        sitemapPath,
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n  </url>\n${subRoutes}</urlset>\n`,
        "utf8",
      );
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), seoFiles()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve("index.html"),
        comandos: resolve("comandos/index.html"),
        directo: resolve("directo/index.html"),
        videos: resolve("videos/index.html"),
        perfil: resolve("perfil/index.html"),
        legales: resolve("legales/index.html"),
        chat: resolve("chat/index.html"),
      },
    },
  },
});
