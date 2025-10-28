import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataWorkspaceMigrationAction } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';

export type WorkspaceMigrationActionV2 =
  MetadataWorkspaceMigrationAction<AllMetadataName>;

export type WorkspaceMigrationActionTypeV2 = WorkspaceMigrationActionV2['type'];

export type ExtractAction<T extends WorkspaceMigrationActionTypeV2> = Extract<
  WorkspaceMigrationActionV2,
  { type: T }
>;
