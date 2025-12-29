import { type InferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/infer-deletion-from-missing-entities.type';

export type WorkspaceMigrationBuilderOptions = {
  inferDeletionFromMissingEntities?: InferDeletionFromMissingEntities;
  isSystemBuild: boolean;
};
