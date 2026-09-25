// ✅ Internal proxy that forwards API requests from the browser to the backend (same-origin)
// Why: the current backend (taskback.orbit-eng.net) was running an expired/self-signed SSL
// certificate and did not answer CORS preflight requests, so the browser could not call it directly.
// The browser talks to Next.js (same origin) and this file forwards the request to the backend.
//
// Note: we read the backend URL straight from the environment (not from lib/config)
// to avoid any infinite loop when the proxy is enabled.

export const dynamic = "force-dynamic";

const UPSTREAM = (
  process.env.API_SERVER_URL ||
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  process.env.NEXT_PUBLIC_LOCAL_API_URL ||
  ""
).replace(/\/+$/, "");

const INSECURE_TLS =
  process.env.API_PROXY_INSECURE_TLS === "true" &&
  process.env.NODE_ENV !== "production";

if (INSECURE_TLS) {
  // Dev only: disable SSL certificate verification for the expired backend certificate.
  // Never applied in production — the correct fix is renewing the certificate on the server.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn(
    "[api-proxy] API_PROXY_INSECURE_TLS=true → TLS verification disabled for the upstream API (dev only).",
  );
}

const HOP_BY_HOP_HEADERS = [
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
  "te",
  "trailer",
  "content-length",
  "content-encoding",
];

async function proxyRequest(request, context) {
  if (!UPSTREAM) {
    return Response.json(
      {
        message:
          "API upstream is not configured. Set API_SERVER_URL (or NEXT_PUBLIC_BASE_API_URL) in .env",
      },
      { status: 500 },
    );
  }

  const params = await context.params;
  const segments = Array.isArray(params?.path) ? params.path : [params?.path ?? ""];
  const targetUrl = `${UPSTREAM}/${segments.join("/")}${request.nextUrl.search}`;

  // Only forward the important headers (auth + content type) and ignore browser-specific ones
  const forwardHeaders = {};
  for (const [key, value] of request.headers.entries()) {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.includes(lower)) continue;
    if (["host", "origin", "referer"].includes(lower)) continue;
    forwardHeaders[key] = value;
  }
  // Same origin → we do not want CORS headers from the backend
  delete forwardHeaders["access-control-request-method"];
  delete forwardHeaders["access-control-request-headers"];

  const hasBody = !["GET", "HEAD"].includes(request.method);

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    for (const [key, value] of upstreamResponse.headers.entries()) {
      const lower = key.toLowerCase();
      if (HOP_BY_HOP_HEADERS.includes(lower)) continue;
      if (lower.startsWith("access-control-")) continue;
      responseHeaders.set(key, value);
    }

    const body = await upstreamResponse.arrayBuffer();

    return new Response(body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[api-proxy] ${request.method} ${targetUrl} failed:`, error);

    return Response.json(
      {
        message: "API proxy could not reach the upstream API.",
        detail: String(error?.cause?.code || error?.cause?.message || error?.message || error),
      },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
