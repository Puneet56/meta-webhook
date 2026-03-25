import { verifySignature } from "./verify";
import { processEvent } from "./events";
import type { WebhookPayload } from "./types";

export function handleVerification(req: Request): Response {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error("META_VERIFY_TOKEN env var not set");
    return new Response("Server misconfigured", { status: 500 });
  }

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Webhook verified successfully");
    return new Response(challenge, { status: 200 });
  }

  console.warn("Webhook verification failed", { mode, token });
  return new Response("Forbidden", { status: 403 });
}

export async function handleWebhook(req: Request): Promise<Response> {
  const appSecret = process.env.META_APP_SECRET;

  if (!appSecret) {
    console.error("META_APP_SECRET env var not set");
    return new Response("Server misconfigured", { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256") ?? "";

  const isValid = await verifySignature(rawBody, signature, appSecret);
  if (!isValid) {
    console.warn("Invalid webhook signature");
    return new Response("Forbidden", { status: 403 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  console.log("Received webhook event:", JSON.stringify(payload, null, 2));

  // Process each entry asynchronously (don't await — respond quickly to Meta)
  processEvent(payload).catch((err) =>
    console.error("Error processing webhook event:", err)
  );

  return new Response("EVENT_RECEIVED", { status: 200 });
}
