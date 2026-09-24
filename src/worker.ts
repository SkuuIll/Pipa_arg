export default {
  async fetch(request: Request, env: { ASSETS: { fetch: (req: Request) => Promise<Response> } }): Promise<Response> {
    const url = new URL(request.url);

    // Redirección 301 de www a apex para SEO consolidado
    if (url.hostname === "www.pipaa.store") {
      url.hostname = "pipaa.store";
      return Response.redirect(url.toString(), 301);
    }

    // Servir assets estáticos compilados desde dist/
    const response = await env.ASSETS.fetch(request);

    // Si es HTML o ruta principal, asegurar cabeceras de seguridad y SEO
    if (response.status === 200) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set("X-Frame-Options", "SAMEORIGIN");
        newHeaders.set("X-Content-Type-Options", "nosniff");
        newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
    }

    return response;
  },
};
