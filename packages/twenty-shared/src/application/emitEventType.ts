export type EmitEventInput = {
  event: string;
  properties?: Record<string, unknown>;
};

export type EmitEventResult = {
  id: string;
  occurredAt: string;
};
