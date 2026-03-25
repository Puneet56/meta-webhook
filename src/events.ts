import type { WebhookPayload, Entry, Change, MessagingEvent } from "./types";

export async function processEvent(payload: WebhookPayload): Promise<void> {
  if (payload.object !== "instagram") {
    console.warn(`Unexpected object type: ${payload.object}`);
    return;
  }

  for (const entry of payload.entry) {
    await processEntry(entry);
  }
}

async function processEntry(entry: Entry): Promise<void> {
  // Changes-based events (comments, mentions, story replies, etc.)
  if (entry.changes) {
    for (const change of entry.changes) {
      await processChange(entry.id, change);
    }
  }

  // Messaging events (DMs via Instagram Messaging API)
  if (entry.messaging) {
    for (const event of entry.messaging) {
      await processMessaging(entry.id, event);
    }
  }
}

async function processChange(accountId: string, change: Change): Promise<void> {
  console.log(`[${accountId}] Change on field: ${change.field}`, change.value);

  switch (change.field) {
    case "comments":
      // Someone commented on your media
      console.log(`[${accountId}] New comment:`, change.value);
      break;

    case "mentions":
      // Your account was mentioned
      console.log(`[${accountId}] New mention:`, change.value);
      break;

    case "story_insights":
      console.log(`[${accountId}] Story insights:`, change.value);
      break;

    case "feed":
      console.log(`[${accountId}] Feed update:`, change.value);
      break;

    case "live_comments":
      console.log(`[${accountId}] Live comment:`, change.value);
      break;

    default:
      console.log(`[${accountId}] Unhandled field "${change.field}":`, change.value);
  }
}

async function processMessaging(accountId: string, event: MessagingEvent): Promise<void> {
  const senderId = event.sender.id;

  if (event.message) {
    if (event.message.is_echo) {
      // Message sent by your page — ignore or log
      console.log(`[${accountId}] Echo message to ${event.recipient.id}`);
      return;
    }

    console.log(`[${accountId}] Message from ${senderId}:`, event.message);

    if (event.message.text) {
      await handleTextMessage(accountId, senderId, event.message.text);
    } else if (event.message.attachments) {
      for (const attachment of event.message.attachments) {
        console.log(`[${accountId}] Attachment from ${senderId}:`, attachment);
      }
    }
  }

  if (event.postback) {
    console.log(`[${accountId}] Postback from ${senderId}:`, event.postback);
  }

  if (event.read) {
    console.log(`[${accountId}] Read receipt from ${senderId}`);
  }
}

async function handleTextMessage(
  accountId: string,
  senderId: string,
  text: string
): Promise<void> {
  console.log(`[${accountId}] Text from ${senderId}: "${text}"`);
  // TODO: add your business logic here
}
