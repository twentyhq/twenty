import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type InferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/infer-deletion-from-missing-entities.type';

export type WorkspaceMigrationBuilderOptions = {
  inferDeletionFromMissingEntities?: InferDeletionFromMissingEntities;
  isSystemBuild: boolean;
  applicationUniversalIdentifier: string;
  applicationDefaultRoleUniversalIdentifier?: string;
};

// The migration runner resolves the workspace Custom application and the application maps for every build.
export type WorkspaceMigrationValidationBuildOptions =
  WorkspaceMigrationBuilderOptions & {
    workspaceCustomApplicationUniversalIdentifier: string;
    flatApplicationMaps: FlatApplicationCacheMaps;
  };
