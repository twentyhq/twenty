export type EmitEventInput = {
  event: string;
  properties?: Record<string, unknown>;
  anonymousId?: string;
};

export type EmitEventResult = {
  id: string;
  occurredAt: string;
};
