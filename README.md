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

Para probar la portada con la API y la base local de Día Sub, usá `npm run dev:worker` en el mismo puerto.

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

## Actualización de YouTube

El Worker sincroniza el canal cada 10 minutos y guarda la última respuesta válida. La galería consulta `/api/youtube`. Para probar la integración en local, usá `npm run dev:worker`.

Con `YOUTUBE_API_KEY` configurada como secreto del Worker, la galería distingue videos subidos de directos anteriores. Mientras falta la clave, muestra las publicaciones recientes del feed oficial. Para usar la clave en local, agregala a `.dev.vars`.

## Activación de Día Sub

La sala usa la conexión WebSocket de Unified Chat Lite para leer Kick, Twitch y YouTube en un panel de PIPAA. El navegador conserva hasta 80 mensajes de los últimos 30 minutos. La opción de escritura abre el chat oficial incrustado de Twitch y requiere una sesión de Twitch para enviar. Día Sub lee el chat público desde el servidor; los webhooks firmados de Kick y Twitch se pueden configurar opcionalmente.

Para activar la integración oficial opcional:

1. Configurá `KICK_BROADCASTER_ID` y `TWITCH_BROADCASTER_ID` con los IDs numéricos de las cuentas de PIPAA en sus respectivas plataformas. Podés cargar cada valor con `npx wrangler secret put NOMBRE`.
2. Guardá un secreto aleatorio de 32 a 100 caracteres con `npx wrangler secret put TWITCH_EVENTSUB_SECRET`. Usá ese mismo secreto al crear los webhooks de Twitch.
3. En la app de Kick, habilitá webhooks con la URL `https://pipaa.store/api/diasub/kick`. Registrá los eventos `chat.message.sent` y `livestream.status.updated` versión 1 en `POST /public/v1/events/subscriptions` para el canal, con método `webhook` y un token autorizado con `events:subscribe`. [Suscripción a eventos de Kick](https://github.com/KickEngineering/KickDevDocs/blob/main/events/subscribe-to-events.md)
4. En Twitch, autorizá a la aplicación a leer el chat con `user:read:chat` y `user:bot` para la identidad lectora, y `channel:bot` para PIPAA. Con el token de aplicación, creá las suscripciones EventSub `channel.chat.message`, `stream.online` y `stream.offline`, versión 1. Usá `broadcaster_user_id` del canal en las tres condiciones y agregá `user_id` de la identidad lectora para el evento de chat. Configurá `transport.method` como `webhook`, el callback `https://pipaa.store/api/diasub/twitch` y el secreto del paso 2. [Configuración de EventSub](https://dev.twitch.tv/docs/chat/authenticating/)
5. Verificá las suscripciones de eventos y hacé una prueba de inicio y fin de directo en cada plataforma. El estado de conexión de cada canal aparece en la web al recibir el primer evento de directo. Si el canal ya estaba transmitiendo al conectar, la apertura se detecta con el siguiente inicio.

Día Sub también escucha el chat público mediante Unified Chat Lite desde el objeto Durable compartido, sin claves. Acepta `!diasub NombreEnElJuego`, `diasub NombreEnElJuego` o `Día Sub NombreEnElJuego` el sábado argentino; exige la insignia de suscriptor de ese canal y guarda la primera inscripción por nombre de usuario y plataforma. El relay no proporciona el identificador de la recompensa: un canje solo puede reconocerse si llega al chat como texto con ese formato, y no se puede confirmar que sea un canje. La conexión depende de un servicio externo, puede interrumpirse y no garantiza recuperar todos los mensajes. El objeto escucha todo el sábado, usa cómputo mientras mantiene el WebSocket abierto y se reconecta tras fallos; las entradas se guardan de forma persistente. Las conexiones oficiales anteriores siguen siendo opcionales.

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
