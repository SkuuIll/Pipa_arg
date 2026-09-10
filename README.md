# PIPAA — Landing page

Landing oficial de PIPAA, jugador profesional argentino de PUBG y creador de Panza Army.

## Requisitos

- Node.js 22.13 o superior
- npm

## Ver el sitio localmente

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

## Compilar la versión estática

```bash
npm run build
```

El resultado queda en `dist/`. Esa carpeta contiene archivos HTML, CSS, JavaScript e imágenes estáticas; no necesita servidor Node ni base de datos.

## Publicar gratis en GitHub Pages

1. Subí el proyecto a un repositorio público de GitHub usando la rama `main`.
2. En el repositorio, abrí **Settings → Pages**.
3. En **Build and deployment → Source**, elegí **GitHub Actions**.
4. Hacé un push a `main`. El workflow incluido en `.github/workflows/deploy-pages.yml` compila y publica la landing automáticamente.

Para usar tu dominio, agregalo en **Settings → Pages → Custom domain** y configurá los registros DNS que indique GitHub. Con el workflow de Actions no hace falta crear un archivo `CNAME`.

## Aparición en Google

En cada publicación, GitHub genera automáticamente el canonical, los datos estructurados de PIPAA, `robots.txt` y `sitemap.xml` usando la dirección real del sitio.

Después de publicar por primera vez:

1. Agregá el dominio en [Google Search Console](https://search.google.com/search-console/).
2. Verificá la propiedad mediante el registro DNS que te entregue Google.
3. En **Sitemaps**, enviá `https://TU-DOMINIO.com/sitemap.xml`.
4. Usá **Inspección de URLs** para solicitar la indexación de la portada.

## Estructura principal

- `index.html`: metadatos y punto de entrada estático de la portada.
- `src/main.tsx`: montaje de React para la portada.
- `app/page.tsx`: contenido de la landing.
- `app/globals.css`: dirección visual y responsive global.
- `comandos/index.html`: punto de entrada estático del subdirectorio de comandos.
- `src/comandos.tsx`: montaje de React para la central de comandos.
- `app/comandos/page.tsx`: simulador de chat interactivo, soundboard y catálogo de comandos troll.
- `app/comandos/commandsData.ts`: base de datos de comandos reales de Nightbot, StreamElements y Dixper.
- `app/comandos/comandos.css`: estilos de la terminal de chat y las tarjetas explicativas.
- `public/`: imágenes y tarjeta social.

El proyecto está preparado específicamente para GitHub Pages y dominio personalizado.

El modo caos, el paralaje y las demostraciones de comandos se ejecutan en el navegador con los archivos de `dist/`. El modo elegido se conserva entre la portada y `/comandos/` cuando el navegador permite almacenamiento local. Con movimiento reducido, el modo caos conserva el estilo neón sin animaciones y muestra «Sin animaciones» junto al botón.
