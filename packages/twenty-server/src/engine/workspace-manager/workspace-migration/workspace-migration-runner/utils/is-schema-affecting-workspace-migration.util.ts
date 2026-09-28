import { SCHEMA_AFFECTING_WORKSPACE_MIGRATION_METADATA_NAMES } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/schema-affecting-workspace-migration-metadata-names.constant';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';

export const isSchemaAffectingWorkspaceMigration = (
  actions: Pick<AllUniversalWorkspaceMigrationAction, 'metadataName'>[],
): boolean =>
  actions.some(({ metadataName }) =>
    SCHEMA_AFFECTING_WORKSPACE_MIGRATION_METADATA_NAMES.some(
      (schemaAffectingMetadataName) =>
        schemaAffectingMetadataName === metadataName,
    ),
  );
