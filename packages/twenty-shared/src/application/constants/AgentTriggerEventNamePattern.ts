// Agents only react to a concrete object and action: wildcards would start a paid run on every write
export const AGENT_TRIGGER_EVENT_NAME_PATTERN =
  /^[a-z][a-zA-Z0-9]*\.(created|updated|deleted|destroyed|restored|upserted)$/;
