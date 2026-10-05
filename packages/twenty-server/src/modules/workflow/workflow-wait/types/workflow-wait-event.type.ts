export type WorkflowWaitEvent = {
  eventName: string;
  recordId: string;
  // The record after the event, or before it when it was deleted
  record: Record<string, unknown>;
  before?: Record<string, unknown>;
  updatedFields?: string[];
};
