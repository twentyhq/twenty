import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';

export const resolveFieldMetadataIdOrThrow = ({
  fieldMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  fieldMetadataUniversalIdentifier: string | null;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): string => {
  if (!isDefined(fieldMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Could not found any field metadata universal identifier to resolve`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier: fieldMetadataUniversalIdentifier,
  });

  if (!isDefined(flatFieldMetadata)) {
    throw new FlatEntityMapsException(
      `Field metadata not found for universal identifier: ${fieldMetadataUniversalIdentifier}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatFieldMetadata.id;
};
