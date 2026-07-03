import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';

type GenericUniversalFlatEntity = { universalIdentifier: string };

const toRecordByUniversalIdentifierOrThrow = ({
  flatEntities,
  metadataName,
  operation,
}: {
  flatEntities: GenericUniversalFlatEntity[];
  metadataName: string;
  operation: 'flatEntityToCreate' | 'flatEntityToUpdate' | 'flatEntityToDelete';
}): Record<string, GenericUniversalFlatEntity> => {
  const recordByUniversalIdentifier: Record<
    string,
    GenericUniversalFlatEntity
  > = {};
  const seenUniversalIdentifiers = new Set<string>();

  for (const flatEntity of flatEntities) {
    if (seenUniversalIdentifiers.has(flatEntity.universalIdentifier)) {
      throw new FlatEntityMapsException(
        `Duplicate universalIdentifier "${flatEntity.universalIdentifier}" in ${operation} for metadata "${metadataName}"`,
        FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
      );
    }

    seenUniversalIdentifiers.add(flatEntity.universalIdentifier);
    recordByUniversalIdentifier[flatEntity.universalIdentifier] = flatEntity;
  }

  return recordByUniversalIdentifier;
};

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
      flatEntityToCreate: toRecordByUniversalIdentifierOrThrow({
        flatEntities: operations.flatEntityToCreate,
        metadataName,
        operation: 'flatEntityToCreate',
      }),
      flatEntityToUpdate: toRecordByUniversalIdentifierOrThrow({
        flatEntities: operations.flatEntityToUpdate,
        metadataName,
        operation: 'flatEntityToUpdate',
      }),
      flatEntityToDelete: toRecordByUniversalIdentifierOrThrow({
        flatEntities: operations.flatEntityToDelete,
        metadataName,
        operation: 'flatEntityToDelete',
      }),
    };
  }

  return recordMatrix as unknown as AllFlatEntityOperationRecordByMetadataName;
};
