import { type AllMetadataName } from 'twenty-shared/metadata';

export type WorkspaceMigrationBuilderOptions = {
  inferDeletionFromMissingEntities?: Partial<Record<AllMetadataName, boolean>>;
  isSystemBuild: boolean;
};
