import { type AllMetadataName } from 'twenty-shared/metadata';

import {
  WorkspaceMigrationActionType,
  type MetadataWorkspaceMigrationAction,
} from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';

export type WorkspaceMigrationActionV2 = MetadataWorkspaceMigrationAction<
  AllMetadataName,
  WorkspaceMigrationActionType
>;
