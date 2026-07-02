import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';

type GenericUniversalFlatEntity = { universalIdentifier: string };

const toRecordByUniversalIdentifier = (
  flatEntities: GenericUniversalFlatEntity[],
): Record<string, GenericUniversalFlatEntity> =>
  Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  );

// Compat bridge: array-based API callers are transpiled into the canonical record
// matrix so the side-effect engine and downstream from/to computation stay record-native.
// To be removed once every caller produces records directly.
export const transpileFlatEntityOperationArrayToRecord = (
  allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName,
): AllFlatEntityOperationRecordByMetadataName => {
  const genericMatrix =
    allFlatEntityOperationByMetadataName as unknown as Record<
      string,
      | {
          flatEntityToCreate: GenericUniversalFlatEntity[];
          flatEntityToUpdate: GenericUniversalFlatEntity[];
          flatEntityToDelete: GenericUniversalFlatEntity[];
        }
      | undefined
    >;
  const recordMatrix: Record<
    string,
    {
      flatEntityToCreate: Record<string, GenericUniversalFlatEntity>;
      flatEntityToUpdate: Record<string, GenericUniversalFlatEntity>;
      flatEntityToDelete: Record<string, GenericUniversalFlatEntity>;
    }
  > = {};

  for (const metadataName of Object.keys(genericMatrix)) {
    const operations = genericMatrix[metadataName];

    if (!isDefined(operations)) {
      continue;
    }

    recordMatrix[metadataName] = {
      flatEntityToCreate: toRecordByUniversalIdentifier(
        operations.flatEntityToCreate,
      ),
      flatEntityToUpdate: toRecordByUniversalIdentifier(
        operations.flatEntityToUpdate,
      ),
      flatEntityToDelete: toRecordByUniversalIdentifier(
        operations.flatEntityToDelete,
      ),
    };
  }

  return recordMatrix as unknown as AllFlatEntityOperationRecordByMetadataName;
};
