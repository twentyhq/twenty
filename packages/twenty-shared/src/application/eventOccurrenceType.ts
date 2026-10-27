export type EventOccurrence = {
  id: string;
  event: string;
  occurredAt: string;
  properties: Record<string, unknown>;
};
