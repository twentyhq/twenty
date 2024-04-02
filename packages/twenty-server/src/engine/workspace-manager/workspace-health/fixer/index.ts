import { WorkspaceNullableFixer } from './workspace-nullable.fixer';
import { WorkspaceDefaultValueFixer } from './workspace-default-value.fixer';
import { WorkspaceTypeFixer } from './workspace-type.fixer';
import { WorkspaceTargetColumnMapFixer } from './workspace-target-column-map.fixer';

export const workspaceFixers = [
  WorkspaceNullableFixer,
  WorkspaceDefaultValueFixer,
  WorkspaceTypeFixer,
  WorkspaceTargetColumnMapFixer,
];
