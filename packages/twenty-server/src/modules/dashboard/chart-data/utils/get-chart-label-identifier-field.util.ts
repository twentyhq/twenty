import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getChartLabelIdentifierField = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): FlatFieldMetadata | null => {
  const { labelIdentifierFieldMetadataId } = flatObjectMetadata;

  if (!isDefined(labelIdentifierFieldMetadataId)) {
    return null;
  }

  const labelIdentifierField = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatFieldMetadataMaps,
    flatEntityId: labelIdentifierFieldMetadataId,
  });

  if (!isDefined(labelIdentifierField) || labelIdentifierField.name === 'id') {
    return null;
  }

  if (
    labelIdentifierField.type !== FieldMetadataType.FULL_NAME &&
    labelIdentifierField.type !== FieldMetadataType.TEXT &&
    labelIdentifierField.type !== FieldMetadataType.UUID
  ) {
    return null;
  }

  return labelIdentifierField;
};
