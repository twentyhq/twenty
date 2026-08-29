import {
  compositeTypeDefinitions,
  FieldMetadataType,
  type ObjectRecordOrderByForRelationField,
  type OrderByDirection,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getChartLabelIdentifierField } from 'src/modules/dashboard/chart-data/utils/get-chart-label-identifier-field.util';

export const getBareRelationOrderBy = ({
  groupByFieldMetadata,
  direction,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  groupByFieldMetadata: FlatFieldMetadata;
  direction: OrderByDirection;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): ObjectRecordOrderByForRelationField[] => {
  const orderById: ObjectRecordOrderByForRelationField = {
    [groupByFieldMetadata.name]: {
      id: direction,
    },
  };

  const { relationTargetObjectMetadataId } = groupByFieldMetadata;

  if (!isDefined(relationTargetObjectMetadataId)) {
    return [orderById];
  }

  const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationTargetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(targetObjectMetadata)) {
    return [orderById];
  }

  const labelIdentifierField = getChartLabelIdentifierField({
    flatObjectMetadata: targetObjectMetadata,
    flatFieldMetadataMaps,
  });

  if (!isDefined(labelIdentifierField)) {
    return [orderById];
  }

  if (labelIdentifierField.type === FieldMetadataType.FULL_NAME) {
    const compositeType = compositeTypeDefinitions.get(
      FieldMetadataType.FULL_NAME,
    );

    if (!isDefined(compositeType)) {
      return [orderById];
    }

    return [
      ...compositeType.properties.map((property) => ({
        [groupByFieldMetadata.name]: {
          [labelIdentifierField.name]: {
            [property.name]: direction,
          },
        },
      })),
      orderById,
    ];
  }

  return [
    {
      [groupByFieldMetadata.name]: {
        [labelIdentifierField.name]: direction,
      },
    },
    orderById,
  ];
};
