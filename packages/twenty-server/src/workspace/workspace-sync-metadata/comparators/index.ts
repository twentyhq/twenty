import { WorkspaceFieldComparator } from './workspace-field.comparator';
import { WorkspaceObjectComparator } from './workspace-object.comparator';
import { WorkspaceRelationComparator } from './workspace-relation.comparator';

export const workspaceSyncMetadataComparators = [
  WorkspaceFieldComparator,
  WorkspaceObjectComparator,
  WorkspaceRelationComparator,
];
