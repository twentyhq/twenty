import { WorkspaceAgentComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-agent.comparator';
import { WorkspaceFieldRelationComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field-relation.comparator';
import { WorkspaceIndexComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-index.comparator';
import { WorkspaceRoleComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-role.comparator';

import { WorkspaceFieldComparator } from './workspace-field.comparator';
import { WorkspaceObjectComparator } from './workspace-object.comparator';

export const workspaceSyncMetadataComparators = [
  WorkspaceFieldComparator,
  WorkspaceFieldRelationComparator,
  WorkspaceObjectComparator,
  WorkspaceIndexComparator,
  WorkspaceRoleComparator,
  WorkspaceAgentComparator,
];
