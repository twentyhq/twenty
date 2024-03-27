import { WorkspaceNullableFixer } from './workspace-nullable.fixer';
import { WorkspaceDefaultValueFixer } from './workspace-default-value.fixer';
import { WorkspaceTypeFixer } from './workspace-type.fixer';

export const workspaceFixers = [
  WorkspaceNullableFixer,
  WorkspaceDefaultValueFixer,
  WorkspaceTypeFixer,
];
