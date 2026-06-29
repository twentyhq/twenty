import { isDefined } from 'twenty-shared/utils';

import { type PreallocatedIdByUniversalIdentifierByMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const buildPreallocatedIdByUniversalIdentifierFromActions = (
  actions: AllUniversalWorkspaceMigrationAction[],
): PreallocatedIdByUniversalIdentifierByMetadataName => {
  const objectMetadata: Record<string, string> = {};
  const fieldMetadata: Record<string, string> = {};

  for (const action of actions) {
    if (action.type !== 'create') {
      continue;
    }

    if (action.metadataName === 'objectMetadata') {
      if (isDefined(action.id)) {
        objectMetadata[action.flatEntity.universalIdentifier] = action.id;
      }

      const fieldIdByUniversalIdentifier =
        action.fieldIdByUniversalIdentifier ?? {};

      for (const universalFlatFieldMetadata of action.universalFlatFieldMetadatas) {
        const fieldId =
          fieldIdByUniversalIdentifier[
            universalFlatFieldMetadata.universalIdentifier
          ];

        if (isDefined(fieldId)) {
          fieldMetadata[universalFlatFieldMetadata.universalIdentifier] =
            fieldId;
        }
      }

      continue;
    }

    if (action.metadataName === 'fieldMetadata') {
      if (isDefined(action.id)) {
        fieldMetadata[action.flatEntity.universalIdentifier] = action.id;
      }

      if (
        isDefined(action.relatedUniversalFlatFieldMetadata) &&
        isDefined(action.relatedFieldId)
      ) {
        fieldMetadata[
          action.relatedUniversalFlatFieldMetadata.universalIdentifier
        ] = action.relatedFieldId;
      }
    }
  }

  return { objectMetadata, fieldMetadata };
};
