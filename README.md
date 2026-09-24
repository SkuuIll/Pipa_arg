# PIPAA — Landing page

Landing oficial de PIPAA, jugador profesional argentino de PUBG y creador de Panza Army.

- **Dominio de producción:** [https://pipaa.store](https://pipaa.store)
- **Central de comandos:** [https://pipaa.store/comandos/](https://pipaa.store/comandos/)

## Requisitos

- Node.js 22.13 o superior
- npm

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Compilar versión estática

```bash
npm run build
```

El resultado queda en `dist/` con todos los metadatos optimizados para Google (Schema.org, sitemap.xml, robots.txt y Googlebot).

## Despliegue en Cloudflare Worker

El proyecto se despliega como un Cloudflare Worker con Static Assets y enrutamiento automático para `pipaa.store`:

```bash
npm run build
npx wrangler deploy
```

## Aparición en Google

1. En [Google Search Console](https://search.google.com/search-console/) agrega la propiedad de dominio `pipaa.store`.
2. Verifica la propiedad mediante el registro DNS provisto por Google.
3. En **Sitemaps**, envía `https://pipaa.store/sitemap.xml`.
4. Solicita la indexación de las URLs `/` y `/comandos/`.

## Estructura principal

- `index.html`: metadatos y punto de entrada de la portada con datos estructurados para Google.
- `src/main.tsx`: montaje de React para la portada.
- `src/worker.ts`: Worker de Cloudflare para servir assets estáticos y gestionar redirecciones 301.
- `wrangler.jsonc`: configuración de Cloudflare Worker y Custom Domains.
- `app/page.tsx`: contenido de la landing.
- `app/globals.css`: dirección visual y responsive global.
- `comandos/index.html`: punto de entrada estático del subdirectorio de comandos.
- `src/comandos.tsx`: montaje de React para la central de comandos.
- `app/comandos/page.tsx`: simulador de chat interactivo, soundboard y catálogo de comandos troll.
- `public/`: imágenes, favicons, robots.txt, sitemap.xml y _headers de Cloudflare.
