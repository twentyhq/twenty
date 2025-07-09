import { WorkspaceMigrationFieldActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { WorkspaceMigrationIndexActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { WorkspaceMigrationObjectActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';

export type WorkspaceMigrationActionV2 =
  | WorkspaceMigrationObjectActionV2
  | WorkspaceMigrationFieldActionV2
  | WorkspaceMigrationIndexActionV2;

export type WorkspaceMigrationActionTypeV2 = WorkspaceMigrationActionV2['type'];
