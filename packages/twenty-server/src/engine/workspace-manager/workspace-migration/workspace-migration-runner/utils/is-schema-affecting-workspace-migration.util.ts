import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { isSchemaAffectingMetadataName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/is-schema-affecting-metadata-name.util';

export const isSchemaAffectingWorkspaceMigration = (
  actions: Pick<AllUniversalWorkspaceMigrationAction, 'metadataName'>[],
): boolean =>
  actions.some(({ metadataName }) =>
    isSchemaAffectingMetadataName(metadataName),
  );
