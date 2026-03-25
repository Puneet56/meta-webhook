import { handleVerification, handleWebhook } from "./src/webhook";

const PORT = parseInt(process.env.PORT ?? "3000");

Bun.serve({
  port: PORT,
  routes: {
    "/webhook": {
      GET: handleVerification,
      POST: handleWebhook,
    },
    "/health": {
      GET: () => Response.json({ status: "ok" }),
    },
  },
  fetch(req) {
    return new Response("Not found", { status: 404 });
  },
});

console.log(`Meta webhook server running on port ${PORT}`);
console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
