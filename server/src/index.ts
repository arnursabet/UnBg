import { config } from "./lib/config";
import { json, notFound, error } from "./lib/response";
import {
  SECURITY_HEADERS,
  checkRateLimit,
  getClientIp,
  startRateLimitCleanup,
} from "./lib/security";
import { handleUpload } from "./routes/upload";
import { handleGetImage, handleDeleteImage } from "./routes/images";
import { handleRedirect } from "./routes/redirect";

startRateLimitCleanup();

function getCorsOrigin(origin: string | null): string {
  return origin && config.allowedOrigins.includes(origin)
    ? origin
    : config.allowedOrigins[0];
}

function extractId(pathname: string): string | null {
  const parts = pathname.split("/");
  return parts[parts.length - 1] || null;
}

const server = Bun.serve({
  port: config.port,

  async fetch(req) {
    const url = new URL(req.url);
    const corsOrigin = getCorsOrigin(req.headers.get("origin"));

    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname !== "/health" && !checkRateLimit(getClientIp(req))) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          ...SECURITY_HEADERS,
        },
      });
    }

    let response: Response;

    try {
      if (url.pathname === "/api/upload" && req.method === "POST") {
        response = await handleUpload(req);
      } else if (url.pathname.startsWith("/api/images/")) {
        const id = extractId(url.pathname);
        if (!id) {
          response = notFound("Invalid image ID");
        } else if (req.method === "GET") {
          response = await handleGetImage(id);
        } else if (req.method === "DELETE") {
          response = await handleDeleteImage(id);
        } else {
          response = json({ error: "Method not allowed" }, 405);
        }
      } else if (url.pathname.startsWith("/i/")) {
        const shortId = extractId(url.pathname);
        if (!shortId) {
          response = notFound("Invalid short ID");
        } else {
          response = await handleRedirect(shortId);
        }
      } else if (url.pathname === "/health") {
        response = json({ status: "ok" });
      } else {
        response = notFound();
      }
    } catch (err) {
      console.error("Server error:", err);
      response = error("Internal server error");
    }

    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries({
      ...corsHeaders,
      ...SECURITY_HEADERS,
    })) {
      headers.set(key, value);
    }

    return new Response(response.body, { status: response.status, headers });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
