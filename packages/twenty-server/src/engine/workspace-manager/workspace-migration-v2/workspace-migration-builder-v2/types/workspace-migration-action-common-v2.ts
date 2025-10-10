import {
  MetadataWorkspaceMigrationAction,
  MetadataWorkspaceMigrationActionType,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export type WorkspaceMigrationActionV2 = {
  [T in AllMetadataName]: MetadataWorkspaceMigrationAction<T>;
}[AllMetadataName];

export type WorkspaceMigrationActionTypeV2 =
  MetadataWorkspaceMigrationActionType;

export type ExtractAction<T extends WorkspaceMigrationActionTypeV2> = Extract<
  WorkspaceMigrationActionV2,
  { type: T }
>;
