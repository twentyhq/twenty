import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type PreallocatedIdByUniversalIdentifierByMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export const buildPreallocatedIdByUniversalIdentifierFromActions = (
  actions: AllUniversalWorkspaceMigrationAction[],
): PreallocatedIdByUniversalIdentifierByMetadataName => {
  const preallocatedIdByUniversalIdentifierByMetadataName: PreallocatedIdByUniversalIdentifierByMetadataName =
    {};

  const registerId = ({
    metadataName,
    universalIdentifier,
    id,
  }: {
    metadataName: AllMetadataName;
    universalIdentifier: string;
    id: string | undefined;
  }) => {
    if (!isDefined(id)) {
      return;
    }

    const idByUniversalIdentifier =
      preallocatedIdByUniversalIdentifierByMetadataName[metadataName] ?? {};

    idByUniversalIdentifier[universalIdentifier] = id;
    preallocatedIdByUniversalIdentifierByMetadataName[metadataName] =
      idByUniversalIdentifier;
  };

  for (const action of actions) {
    if (action.type !== 'create') {
      continue;
    }

    registerId({
      metadataName: action.metadataName,
      universalIdentifier: action.flatEntity.universalIdentifier,
      id: action.id,
    });

    if (action.metadataName === 'objectMetadata') {
      const fieldIdByUniversalIdentifier =
        action.fieldIdByUniversalIdentifier ?? {};

      for (const universalFlatFieldMetadata of action.universalFlatFieldMetadatas) {
        registerId({
          metadataName: 'fieldMetadata',
          universalIdentifier: universalFlatFieldMetadata.universalIdentifier,
          id: fieldIdByUniversalIdentifier[
            universalFlatFieldMetadata.universalIdentifier
          ],
        });
      }
    }

    if (
      action.metadataName === 'fieldMetadata' &&
      isDefined(action.relatedUniversalFlatFieldMetadata)
    ) {
      registerId({
        metadataName: 'fieldMetadata',
        universalIdentifier:
          action.relatedUniversalFlatFieldMetadata.universalIdentifier,
        id: action.relatedFieldId,
      });
    }
  }

  return preallocatedIdByUniversalIdentifierByMetadataName;
};
