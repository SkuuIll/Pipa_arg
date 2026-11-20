# Rediseño de la web de PIPAA

La web tiene que servir en dos momentos. Si PIPAA prende, alguien que entra desde el celular debería poder ver el directo, leer el chat y anotarse al Día Sub desde una sola sala. Cuando termina, quien vuelve al sitio debería encontrar el último video que publicó. La primera entrega resuelve la actualización de YouTube porque de ella dependen tanto la portada como el archivo de videos.

## Qué pasa hoy con YouTube

El 19 de noviembre comprobé que el ID configurado coincide con el canal de PIPAA. El feed oficial devolvió publicaciones de ese mismo día y el intermediario también respondió. En esa consulta, el primer título fue «FULL VICIO GTA VI». Eso confirma que llegan novedades al feed. Para saber si una publicación es un video subido, un directo en curso o una repetición hace falta mirar sus metadatos. [Feed del canal](https://www.youtube.com/feeds/videos.xml?channel_id=UC1yPRd95ALNsrNQAuarFSjw)

Hoy la página arranca con seis videos escritos en el componente, después carga una lista local y consulta el feed una vez al abrirse. Si falla la consulta, sigue mostrando datos guardados con textos como «Hace 2 días». Si tiene éxito, agrega los IDs nuevos al principio pero conserva la información antigua de los que ya existían. Además, clasifica los directos buscando palabras como «scrims» en el título. Por eso el primer elemento puede recibir el rótulo «Último video subido» aunque la web no haya verificado esa condición.

## 1. Hacer que los últimos videos se actualicen solos

- **Fuente.** Resolver el canal oficial y su lista de subidas con YouTube Data API. Leer los elementos recientes y consultar sus metadatos en lote. Separar emisiones programadas, directos activos, repeticiones y publicaciones ordinarias según los datos de YouTube. La fecha que ordena las tarjetas es la de publicación pública del video. [Canales](https://developers.google.com/youtube/v3/docs/channels) · [Elementos de una playlist](https://developers.google.com/youtube/v3/docs/playlistItems/list) · [Datos de cada video](https://developers.google.com/youtube/v3/docs/videos)
- **Sincronización.** Ejecutar una tarea del Worker de Cloudflare cada 10 minutos, incluso si nadie visita la web. Guardar la clave de lectura como secreto del Worker. Revisar la cuota al configurar la tarea. Usar el feed público para ofrecer publicaciones recientes si todavía falta la clave, identificándolas como publicaciones del canal mientras su tipo esté pendiente de verificar.
- **Datos compartidos.** Guardar por ID el título vigente, la fecha absoluta, la miniatura, el estado y la URL. Actualizar títulos y retirar del catálogo público los videos eliminados o privados confirmados. Recorrer páginas adicionales cuando las últimas publicaciones sean directos y falten videos para completar la portada.
- **Consulta.** Servir portada y archivo desde una misma API del sitio. Una pestaña abierta vuelve a consultar esa API al recuperar el foco y periódicamente mientras está visible. Calcular «hace dos días» desde la fecha real al mostrar la tarjeta.
- **Si YouTube falla.** Conservar la última sincronización válida y su hora. Si todavía no existe una copia válida, mostrar el acceso al canal. Registrar el error para poder distinguir una falla de red, una cuota agotada y una respuesta vacía.
- **Prueba de entrega.** Comparar los primeros videos con la pestaña de videos del canal. Simular una publicación nueva, una repetición, un cambio de título y una caída del servicio. Confirmar que portada y archivo se actualizan sin editar archivos ni desplegar otra vez. Medir con una publicación real el objetivo de un ciclo de sincronización desde que aparece en la API. [Videos de PIPAA](https://www.youtube.com/@PIPAArg/videos)

## 2. Darle un destino claro a cada visita

| Página | Qué encuentra quien entra |
| --- | --- |
| Inicio · `/` | Una pieza principal. Si hay directo confirmado, lleva a la sala. Fuera de emisión, destaca el último video verificado. Debajo aparecen tres publicaciones recientes y el acceso a la comunidad. Si el estado del directo es desconocido, la sala sigue accesible. |
| Directo · `/directo/` | Reproductor de Kick o Twitch, multichat de Kick, Twitch y YouTube, y lista del Día Sub. La portada carga más rápido al reservar los reproductores y el chat para esta ruta. |
| Videos · `/videos/` | Archivo con dos vistas, «Videos» y «Directos anteriores», cada una ordenada por fecha. Permite cargar publicaciones anteriores y abrir cada video en la web o en YouTube. |
| Perfil · `/perfil/` | Presentación breve de PIPAA, trayectoria, selección argentina y setup. Las fuentes, detalles técnicos y contacto comercial quedan junto al contenido correspondiente. |

La navegación principal tiene cuatro destinos. Para comprar, el pie reúne los accesos directos que ya utiliza el sitio. [Dixper](https://dixper.gg/pipa_arg) · [WeezyX](https://weezyx.com/t/pipa_arg)

## 3. Diseñar la sala alrededor de lo que pasa durante el stream

**En escritorio**, el reproductor ocupa aproximadamente dos tercios del ancho. Al lado queda un panel con dos pestañas, Chat y Día Sub. Un modo cine ensancha el video. **En móvil**, el reproductor va arriba y las pestañas debajo, al alcance del pulgar. Cambiar de pestaña conserva la reproducción y la plataforma elegida.

**Multichat.** La primera vista combina los tres canales. Los filtros permiten leer solo Kick, Twitch o YouTube. Cada plataforma tiene un acceso para escribir en el chat original. Probar el modo transparente del proveedor sobre un fondo propio, el silencio antes del directo y la recuperación tras una desconexión. Durante una emisión, verificar con un mensaje real por plataforma que los filtros corresponden al canal correcto.

**Día Sub.** El enlace compartible `/directo/#diasub` abre directamente la lista. Los sábados, en horario argentino y con el canal en directo, el suscriptor manda `!diasub` o `diasub` por Kick o Twitch. Reutilizar la validación de eventos del Worker. La lista muestra posición, usuario y plataforma, distingue vacío de error y conserva una inscripción por cuenta y plataforma. Verificar apertura, cierre y cambio de sábado. La prueba real requiere publicar el Worker y autorizar los eventos de ambos canales.

## 4. Aplicar la identidad de Panza Army a toda la navegación

Usar el retrato y las miniaturas reales como elementos principales de la portada. Reservar el verde lima para la acción principal y la selección activa, usar el violeta para paneles y dejar el negro alrededor del reproductor. Compartir cabecera, tipografía, controles, foco de teclado y pie entre las cuatro páginas. Mostrar el estado de emisión con texto además del color. La etiqueta «En vivo» requiere una señal vigente del canal, independiente de que sea sábado.

## Orden de trabajo y comprobación

1. **YouTube primero.** Entregar la sincronización y probarla sobre la galería actual. Así se puede comprobar que el problema de los videos quedó resuelto antes de cambiar su diseño.
2. **Portada y sala.** Preparar ambas vistas en móvil y escritorio, implementar las rutas y conectar el estado del canal. Probar una entrada normal y una entrada directa por el enlace del Día Sub.
3. **Archivo y perfil.** Llevar el contenido existente a sus páginas, actualizar navegación y sitemap, y dirigir los enlaces antiguos a su sección equivalente. Conservar los enlaces compartidos de la web actual.
4. **Validación previa a publicar.** Recorrer el sitio con teclado y a 360, 768 y 1440 px. Comprobar que entrar a Inicio no descarga iframes de emisión, que cambiar a Día Sub no corta el video y que una falla externa no oculta las otras secciones. Tras conectar los canales, comprobar una nueva publicación real, los tres chats y el canje en un directo de sábado.
