import { v4 } from 'uuid';

import { isDefined } from 'twenty-shared/utils';

import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const buildFieldIdToBeCreatedInMigrationByUniversalIdentifierMap = (
  actions: AllUniversalWorkspaceMigrationAction[],
): Map<string, string> => {
  const fieldIdByUniversalIdentifier = new Map<string, string>();

  for (const action of actions) {
    if (action.type !== 'create' || action.metadataName !== 'fieldMetadata') {
      continue;
    }

    if (
      !fieldIdByUniversalIdentifier.has(action.flatEntity.universalIdentifier)
    ) {
      fieldIdByUniversalIdentifier.set(
        action.flatEntity.universalIdentifier,
        action.id ?? v4(),
      );
    }

    if (
      isDefined(action.relatedUniversalFlatFieldMetadata) &&
      !fieldIdByUniversalIdentifier.has(
        action.relatedUniversalFlatFieldMetadata.universalIdentifier,
      )
    ) {
      fieldIdByUniversalIdentifier.set(
        action.relatedUniversalFlatFieldMetadata.universalIdentifier,
        action.relatedFieldId ?? v4(),
      );
    }
  }

  return fieldIdByUniversalIdentifier;
};
