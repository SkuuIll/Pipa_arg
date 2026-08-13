import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");

const identityGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": siteUrl ? `${siteUrl}/#pipa` : "#pipa",
      name: "Leonardo Rafael Ruppel",
      alternateName: ["PIPAA", "Pipa_ARG"],
      description: "Jugador profesional argentino de PUBG, streamer y creador de la comunidad Panza Army.",
      image: siteUrl ? `${siteUrl}/pipa-banner.png` : undefined,
      url: siteUrl || undefined,
      nationality: { "@type": "Country", name: "Argentina" },
      jobTitle: ["Jugador profesional de PUBG", "Streamer", "Creador de contenido"],
      knowsAbout: ["PUBG: Battlegrounds", "Esports", "Streaming", "Gaming competitivo"],
      award: "5.º puesto mundial con Argentina — PUBG Nations Cup 2026",
      sameAs: [
        "https://www.twitch.tv/pipa_arg",
        "https://kick.com/pipa_arg",
        "https://www.youtube.com/@PIPAArg",
        "https://www.tiktok.com/@pipa_arg",
        "https://x.com/Pipa_arg",
        "https://www.instagram.com/rafa.ruppel",
      ],
    },
    {
      "@type": "WebSite",
      "@id": siteUrl ? `${siteUrl}/#website` : "#website",
      name: "PIPAA",
      alternateName: "Pipa_ARG",
      url: siteUrl || undefined,
      inLanguage: "es-AR",
      about: { "@id": siteUrl ? `${siteUrl}/#pipa` : "#pipa" },
    },
  ],
};

function seoFiles() {
  return {
    name: "pipa-seo",
    transformIndexHtml(html: string) {
      const canonical = siteUrl
        ? `<link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:url" content="${siteUrl}/" />`
        : "";
      const imageUrl = siteUrl ? `${siteUrl}/og-v2.png` : "./og-v2.png";
      const structuredData = `<script type="application/ld+json">${JSON.stringify(identityGraph)}</script>`;

      return html
        .replace("<!-- SEO_RUNTIME -->", `${canonical}\n    ${structuredData}`)
        .replaceAll("./og-v2.png", imageUrl);
    },
    closeBundle() {
      const dist = resolve("dist");
      const sitemapPath = resolve(dist, "sitemap.xml");
      const sitemapLine = siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml` : "";
      writeFileSync(resolve(dist, "robots.txt"), `User-agent: *\nAllow: /${sitemapLine}\n`, "utf8");

      if (siteUrl) {
        const today = new Date().toISOString().slice(0, 10);
        writeFileSync(
          sitemapPath,
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
          "utf8",
        );
      } else {
        rmSync(sitemapPath, { force: true });
      }
    },
  };
}

export default defineConfig({
  // Rutas relativas: funciona tanto en usuario.github.io/repositorio como con dominio propio.
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
  },
});
