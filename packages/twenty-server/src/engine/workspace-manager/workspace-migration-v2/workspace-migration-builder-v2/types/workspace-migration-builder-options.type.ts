import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

export type WorkspaceMigrationBuilderOptions = {
  inferDeletionFromMissingEntities?: Partial<Record<AllMetadataName, boolean>>;
  isSystemBuild: boolean;
};
