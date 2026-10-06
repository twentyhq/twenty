import {
  WORKSPACE_SIGNAL_NAMES,
  type WorkspaceSignalName,
} from '@/application/constants/WorkspaceSignalNames';

export const isWorkspaceSignalName = (
  value: unknown,
): value is WorkspaceSignalName =>
  typeof value === 'string' &&
  (WORKSPACE_SIGNAL_NAMES as readonly string[]).includes(value);
