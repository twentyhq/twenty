export type RequestFormToolStatus = 'pending' | 'answered' | 'skipped';

// Values are keyed by field name.
export type RequestFormToolResult = {
  status: RequestFormToolStatus;
  values?: Record<string, unknown>;
};
