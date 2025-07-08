import { WorkspaceMigrationFieldActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-action-v2';
import { WorkspaceMigrationIndexActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-index-action-v2';
import { WorkspaceMigrationV2ObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-action-v2';
import { WorkspaceMigrationUniquenessActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-uniqueness-action-v2';

export type WorkspaceMigrationActionV2 =
  | WorkspaceMigrationV2ObjectAction
  | WorkspaceMigrationFieldActionV2
  | WorkspaceMigrationUniquenessActionV2
  | WorkspaceMigrationIndexActionV2;

export type WorkspaceMigrationActionTypeV2 = WorkspaceMigrationActionV2['type'];
