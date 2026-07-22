import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getRelationLabelIdentifierColumns = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): {
  labelIdentifierField: FlatFieldMetadata;
  columnNames: string[];
} | null => {
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

  if (labelIdentifierField.type === FieldMetadataType.FULL_NAME) {
    const compositeType = compositeTypeDefinitions.get(
      FieldMetadataType.FULL_NAME,
    );

    if (!isDefined(compositeType)) {
      return null;
    }

    return {
      labelIdentifierField,
      columnNames: [
        'id',
        ...compositeType.properties.map((property) =>
          computeCompositeColumnName(labelIdentifierField.name, property),
        ),
      ],
    };
  }

  if (
    labelIdentifierField.type !== FieldMetadataType.TEXT &&
    labelIdentifierField.type !== FieldMetadataType.UUID
  ) {
    return null;
  }

  return {
    labelIdentifierField,
    columnNames: ['id', labelIdentifierField.name],
  };
};
