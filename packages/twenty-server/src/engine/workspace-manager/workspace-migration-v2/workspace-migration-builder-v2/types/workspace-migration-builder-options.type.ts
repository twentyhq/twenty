import { type AllMetadataName } from 'twenty-shared/metadata';

export type WorkspaceMigrationBuilderOptions = {
  inferDeletionFromMissingEntities?:
    | true
    | Partial<Record<AllMetadataName, boolean>>;
  isSystemBuild: boolean;
};
