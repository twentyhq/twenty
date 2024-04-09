import { WorkspaceMissingColumnFixer } from 'src/engine/workspace-manager/workspace-health/fixer/workspace-missing-column.fixer';

import { WorkspaceNullableFixer } from './workspace-nullable.fixer';
import { WorkspaceDefaultValueFixer } from './workspace-default-value.fixer';
import { WorkspaceTypeFixer } from './workspace-type.fixer';

export const workspaceFixers = [
  WorkspaceNullableFixer,
  WorkspaceDefaultValueFixer,
  WorkspaceTypeFixer,
  WorkspaceMissingColumnFixer,
];
