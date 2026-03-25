import { handleVerification, handleWebhook } from "./src/webhook";

const PORT = parseInt(process.env.PORT ?? "3000");

const startTime = Date.now();

function logRequest(req: Request) {
  const url = new URL(req.url);
  console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);
}

Bun.serve({
  port: PORT,
  routes: {
    "/webhook": {
      GET: (req) => { logRequest(req); return handleVerification(req); },
      POST: (req) => { logRequest(req); return handleWebhook(req); },
    },
    "/health": {
      GET: (req) => {
        logRequest(req);
        return Response.json({ status: "ok", uptime: Math.floor((Date.now() - startTime) / 1000) });
      },
    },
  },
  fetch(req) {
    logRequest(req);
    return new Response("Not found", { status: 404 });
  },
});

console.log(`Meta webhook server running on port ${PORT}`);
console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
