type EmitEventTarget =
  | { event: string; eventUniversalIdentifier?: never }
  | { eventUniversalIdentifier: string; event?: never };

export type EmitEventInput = EmitEventTarget & {
  properties?: Record<string, unknown>;
  // Reusing an id makes a retried emission recognizable as the same occurrence
  id?: string;
};

export type EmitEventResult = {
  id: string;
  occurredAt: string;
};
