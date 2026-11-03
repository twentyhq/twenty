export type EventOccurrence = {
  id: string;
  type: string;
  occurredAt: string;
  properties: Record<string, unknown>;
};
