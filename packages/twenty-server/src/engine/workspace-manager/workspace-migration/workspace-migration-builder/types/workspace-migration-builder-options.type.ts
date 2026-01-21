import { type InferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/infer-deletion-from-missing-entities.type';

export type WorkspaceMigrationBuilderOptions = {
  inferDeletionFromMissingEntities?: InferDeletionFromMissingEntities;
  isSystemBuild: boolean;
};
