import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-flat-entity-property.util';

export const findActiveFlatFieldMetadataById = (
  fieldId: string | null | undefined,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): FlatFieldMetadata | null => {
  if (!isDefined(fieldId)) return null;

  const field = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (
    !isDefined(field) ||
    !resolveEffectiveFlatEntityProperty(field, 'isActive')
  ) {
    return null;
  }

  return field;
};
