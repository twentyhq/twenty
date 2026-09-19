import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const collectCreatedObjectMetadataUniversalIdentifiers = (
  actions: AllUniversalWorkspaceMigrationAction[],
): Set<string> =>
  new Set(
    actions.flatMap((action) =>
      action.type === 'create' && action.metadataName === 'objectMetadata'
        ? [action.flatEntity.universalIdentifier]
        : [],
    ),
  );
