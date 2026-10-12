export type WorkflowWaitForEventActionInput = {
  eventName: string;
  recordId?: string | null;
  updatedFields?: string[] | null;
  timeout?: {
    days?: number | string;
    hours?: number | string;
    minutes?: number | string;
  } | null;
};
