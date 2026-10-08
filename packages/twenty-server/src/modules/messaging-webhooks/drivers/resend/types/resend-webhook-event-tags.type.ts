// Documented as an object map but historically also sent as { name, value } entries
export type ResendWebhookEventTags =
  | Record<string, string>
  | { name?: string; value?: string }[];
