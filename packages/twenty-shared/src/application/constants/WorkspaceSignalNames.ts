export const WORKSPACE_SIGNAL_NAMES = [
  'messaging.import',
  'messaging.initialImport',
  'calendar.import',
  'calendar.initialImport',
] as const;

export type WorkspaceSignalName = (typeof WORKSPACE_SIGNAL_NAMES)[number];
