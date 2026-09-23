import { type AllMetadataName } from 'twenty-shared/metadata';

import { SCHEMA_AFFECTING_WORKSPACE_MIGRATION_METADATA_NAMES } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/schema-affecting-workspace-migration-metadata-names.constant';

export const isSchemaAffectingMetadataName = (
  metadataName: AllMetadataName,
): boolean =>
  SCHEMA_AFFECTING_WORKSPACE_MIGRATION_METADATA_NAMES.some(
    (schemaAffectingMetadataName) =>
      schemaAffectingMetadataName === metadataName,
  );
