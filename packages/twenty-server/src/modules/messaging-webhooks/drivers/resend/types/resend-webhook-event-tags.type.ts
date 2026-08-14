// tags are documented as an object map but have historically also appeared
// as { name, value } entries, so both shapes are accepted
export type ResendWebhookEventTags =
  | Record<string, string>
  | { name?: string; value?: string }[];
