import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldByObjectIdAndNameKey } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-by-object-id-and-name-key.util';

export const buildFieldIdByNameMaps = (
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): {
  fieldIdByObjectIdAndName: Map<string, string>;
  fieldById: Map<string, { type: FieldMetadataType }>;
} => {
  const fieldIdByObjectIdAndName = new Map<string, string>();
  const fieldById = new Map<string, { type: FieldMetadataType }>();

  for (const fieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(fieldMetadata)) {
      continue;
    }

    fieldIdByObjectIdAndName.set(
      buildFieldByObjectIdAndNameKey(
        fieldMetadata.objectMetadataId,
        fieldMetadata.name,
      ),
      fieldMetadata.id,
    );

    fieldById.set(fieldMetadata.id, {
      type: fieldMetadata.type,
    });
  }

  return { fieldIdByObjectIdAndName, fieldById };
};
