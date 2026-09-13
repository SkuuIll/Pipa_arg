# Búsqueda de mates y estado del recorte

## Búsqueda implementada

Tres mates vectoriales en trayectoria, setup y comunidad. Cada uno suma una sola vez y los tres desbloquean Cebador oficial de la Panza Army. Progreso local con clave `pipaa:mate-hunt:v1`, saneamiento de datos y funcionamiento en memoria cuando el almacenamiento está bloqueado. El reinicio devuelve el foco al primer mate. No hay audio, cuentas ni peticiones de red propias del juego.

## Validación

Compilar con `npm run build`. Con la web iniciada, ejecutar `PLAYWRIGHT_MODULE=/ruta/a/playwright BROWSERS=chromium node scripts/check-mate-hunt.cjs`. Si Playwright está instalado normalmente, omitir PLAYWRIGHT_MODULE. BROWSERS admite chromium,firefox,webkit; BASE_URL permite cambiar el servidor.

Se comprobó Chromium a 360, 390, 768 y 1440 px: teclado, recolección repetida, rango, persistencia tras recarga, reinicio, movimiento reducido, avisos por encima del dock y ausencia de desbordes. También almacenamiento bloqueado, JSON corrupto e identificadores duplicados/desconocidos.

Firefox y WebKit descargados pero no ejecutables en este host AlmaLinux 8: faltan bibliotecas y versiones de NSS/libstdc++/GTK/ICU. Docker no tiene daemon activo. No se afirma haber validado esos motores ni Safari/Chrome/Edge/Samsung Internet reales.

## Recorte pendiente — no integrado

El usuario eligió seguir intentando con image_gen integrada, descartando el recorte local por segmentación. Tres intentos devolvieron PNG de 1024×1536 RGB, sin canal alfa y con cuadrícula dibujada. Ninguno se integró; el retrato actual permanece intacto. Para completar esta parte hace falta un PNG con transparencia válida o cambiar el método con autorización del usuario. No se ejecutó el fallback CLI/API.

Prompts de los intentos:

### Intento 1

Use case: background-extraction. Edit target: supplied portrait. Remove the purple studio backdrop COMPLETELY, output RGBA PNG with genuinely transparent alpha outside the person. Preserve the person exactly: same face, hair, beard, pose, hands, black sweatshirt, PANZA ARMY lettering, violet/lime rim light ON the person. Do not redraw or beautify person. Preserve original 1024x1536 framing and all hair, both elbows and torso. Carefully isolate wispy hair and fabric edges, remove background light haze, preserve opaque black clothing and white text, no holes in subject. Background pixels must have alpha zero; hair boundary partial alpha. NO checkerboard drawn in image, no solid black/white/colored background, no floor or shadow outside silhouette. This is a production transparent cutout, not a mockup of transparency.

### Intento 2

Remove background from this photo. Deliver a TRANSPARENT PNG sticker of ONLY the man. Use actual RGBA transparency, not a representation of transparency. All empty pixels must be alpha=0. DO NOT draw gray and white squares. Do not add any backdrop color. Keep the original man and original pose unchanged. Exact source dimensions 1024x1536. Preserve black sweater, white PANZA ARMY lettering, hair, facial features and crossed arms. Clean precise edges. Transparent background.

### Intento 3

BACKGROUND REMOVAL ONLY. The uploaded image is the exact target. Return the SAME IMAGE with the surrounding purple background erased to alpha transparency. Request transparent background output. Encode as RGBA PNG, never flatten. Do not generate or draw any checkerboard. Do not recreate the man: preserve exact face, expression, hair, black PANZA ARMY sweater, folded arms and violet/green lighting from the source. No zoom, no resize, no relighting, no solid background. Clean transparent cutout with soft antialiased edge alpha. Everything outside the man is empty, truly transparent. All opaque interior person pixels are retained.
