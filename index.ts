import { handleVerification, handleWebhook } from "./src/webhook";

const PORT = parseInt(process.env.PORT ?? "3000");

const startTime = Date.now();

Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);

    if (url.pathname === "/webhook") {
      if (req.method === "GET") return handleVerification(req);
      if (req.method === "POST") return handleWebhook(req);
    }

    if (url.pathname === "/health" && req.method === "GET") {
      return Response.json({ status: "ok", uptime: Math.floor((Date.now() - startTime) / 1000) });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Meta webhook server running on port ${PORT}`);
console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
