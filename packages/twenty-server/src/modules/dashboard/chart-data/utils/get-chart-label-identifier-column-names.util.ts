import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getChartLabelIdentifierField } from 'src/modules/dashboard/chart-data/utils/get-chart-label-identifier-field.util';

export const getChartLabelIdentifierColumnNames = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string[] | null => {
  const labelIdentifierField = getChartLabelIdentifierField({
    flatObjectMetadata,
    flatFieldMetadataMaps,
  });

  if (!isDefined(labelIdentifierField)) {
    return null;
  }

  if (labelIdentifierField.type === FieldMetadataType.FULL_NAME) {
    const compositeType = compositeTypeDefinitions.get(
      FieldMetadataType.FULL_NAME,
    );

    if (!isDefined(compositeType)) {
      return null;
    }

    return [
      'id',
      ...compositeType.properties.map((property) =>
        computeCompositeColumnName(labelIdentifierField.name, property),
      ),
    ];
  }

  return ['id', labelIdentifierField.name];
};
