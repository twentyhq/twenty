// Workspace-level booleans published by engine modules, readable by trigger
// conditions. Closed list so apps and validators can type them.
export const WORKSPACE_SIGNAL_NAMES = [
  'messaging.import',
  'messaging.initialImport',
  'calendar.import',
  'calendar.initialImport',
] as const;

export type WorkspaceSignalName = (typeof WORKSPACE_SIGNAL_NAMES)[number];
