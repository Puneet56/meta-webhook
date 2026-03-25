export interface WebhookPayload {
  object: "instagram" | string;
  entry: Entry[];
}

export interface Entry {
  id: string;
  time: number;
  changes?: Change[];
  messaging?: MessagingEvent[];
}

export interface Change {
  field: string;
  value: ChangeValue;
}

export interface ChangeValue {
  [key: string]: unknown;
}

// Instagram Messaging (DMs via Messenger API)
export interface MessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: IncomingMessage;
  read?: { watermark: number };
  delivery?: { watermark: number; mids: string[] };
  postback?: { title: string; payload: string };
}

export interface IncomingMessage {
  mid: string;
  text?: string;
  attachments?: Attachment[];
  reply_to?: { mid: string };
  is_echo?: boolean;
}

export interface Attachment {
  type: "image" | "video" | "audio" | "file" | "template" | string;
  payload: {
    url?: string;
    [key: string]: unknown;
  };
}
