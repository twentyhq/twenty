// Keys for the implicit metadata exposed by manual triggers, present both in the
// runtime payload (see workflow-trigger.resolver) and in the trigger output schema.
// Keeping them together ensures the payload key matches the variable path consumed
// in the builder (e.g. {{trigger._metadata.workspaceMemberId}}).
export const WORKFLOW_TRIGGER_METADATA_KEY = '_metadata';

export const WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY =
  'workspaceMemberId';
