import { type MetadataWorkspaceMigrationAction } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export type WorkspaceMigrationActionV2 =
  MetadataWorkspaceMigrationAction<AllMetadataName>;

export type WorkspaceMigrationActionTypeV2 = WorkspaceMigrationActionV2['type'];

export type ExtractAction<T extends WorkspaceMigrationActionTypeV2> = Extract<
  WorkspaceMigrationActionV2,
  { type: T }
>;
