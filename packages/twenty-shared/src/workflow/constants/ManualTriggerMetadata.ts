// Keys for the implicit metadata exposed by manual triggers, shared between the
// runtime payload (server) and the trigger output schema (server + front) so the
// payload key always matches the variable path used in the builder
// (e.g. {{trigger._metadata.workspaceMemberId}}).
export const WORKFLOW_TRIGGER_METADATA_KEY = '_metadata';

export const WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY =
  'workspaceMemberId';
