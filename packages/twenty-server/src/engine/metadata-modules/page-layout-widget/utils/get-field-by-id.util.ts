import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const getFieldById = (
  fieldId: string | null | undefined,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): FlatFieldMetadata | null => {
  if (!isDefined(fieldId)) return null;

  const identifier = flatFieldMetadataMaps.universalIdentifierById[fieldId];

  if (!isDefined(identifier)) return null;

  const field = flatFieldMetadataMaps.byUniversalIdentifier[identifier];

  if (!isDefined(field) || !field.isActive) return null;

  return field;
};
