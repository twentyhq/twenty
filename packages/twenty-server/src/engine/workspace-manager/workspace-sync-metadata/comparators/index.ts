import { WorkspaceFieldRelationComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field-relation.comparator';
import { WorkspaceIndexComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-index.comparator';

import { WorkspaceFieldComparator } from './workspace-field.comparator';
import { WorkspaceObjectComparator } from './workspace-object.comparator';
import { WorkspaceRelationComparator } from './workspace-relation.comparator';

export const workspaceSyncMetadataComparators = [
  WorkspaceFieldComparator,
  WorkspaceFieldRelationComparator,
  WorkspaceObjectComparator,
  WorkspaceRelationComparator,
  WorkspaceIndexComparator,
];
