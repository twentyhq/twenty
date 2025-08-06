import { WorkspaceFieldRelationComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field-relation.comparator';
import { WorkspaceIndexComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-index.comparator';
import { WorkspacePermissionComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-permission.comparator';

import { WorkspaceFieldComparator } from './workspace-field.comparator';
import { WorkspaceObjectComparator } from './workspace-object.comparator';

export const workspaceSyncMetadataComparators = [
  WorkspaceFieldComparator,
  WorkspaceFieldRelationComparator,
  WorkspaceObjectComparator,
  WorkspaceIndexComparator,
  WorkspacePermissionComparator,
];
