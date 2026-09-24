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
      alternateName: ["PIPAA", "Pipa_ARG"],
      description: "Jugador profesional argentino de PUBG, streamer y creador de la comunidad Panza Army.",
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

const comandosGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/comandos/#webpage`,
      url: `${siteUrl}/comandos/`,
      name: "PanzaBot & Comandos Troll — PIPAA (Pipa_ARG)",
      description: "Catálogo interactivo con simulador de chat y soundboard de la Panza Army de PIPAA.",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "PIPAA",
        url: `${siteUrl}/`,
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: `${siteUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Comandos",
            item: `${siteUrl}/comandos/`,
          },
        ],
      },
    },
  ],
};

function seoFiles() {
  return {
    name: "pipa-seo",
    transformIndexHtml(html: string, ctx: { path?: string }) {
      const isComandos = Boolean(ctx.path && ctx.path.includes("comandos"));
      const pageUrl = isComandos ? `${siteUrl}/comandos/` : `${siteUrl}/`;
      const canonicalBlock = `<link rel="canonical" href="${pageUrl}" />\n    <meta property="og:url" content="${pageUrl}" />`;
      const activeGraph = isComandos ? comandosGraph : identityGraph;
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
        // Normalizar og:image y rutas de imagen absoluta para SEO de Google
        .replace(/(['"])(?:\.{1,2}\/)?og-v3\.jpg(['"])/g, `$1${siteUrl}/og-v3.jpg$2`);
    },
    closeBundle() {
      const dist = resolve("dist");
      const sitemapPath = resolve(dist, "sitemap.xml");
      const today = new Date().toISOString().slice(0, 10);

      const robotsContent = [
        "User-agent: *",
        "Allow: /",
        "",
        "User-agent: Googlebot",
        "Allow: /",
        "",
        "User-agent: Googlebot-Image",
        "Allow: /",
        "",
        "User-agent: Bingbot",
        "Allow: /",
        "",
        `Sitemap: ${siteUrl}/sitemap.xml`,
        "",
      ].join("\n");

      writeFileSync(resolve(dist, "robots.txt"), robotsContent, "utf8");

      writeFileSync(
        sitemapPath,
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>${siteUrl}/comandos/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>\n`,
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
      },
    },
  },
});
