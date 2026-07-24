import {
  type ObjectRecordGroupByDateGranularity,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForRelationField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
  type OrderByDirection,
} from 'twenty-shared/types';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from 'src/modules/dashboard/chart-data/constants/graph-default-date-granularity.constant';
import { getRelationFieldOrderBy } from 'src/modules/dashboard/chart-data/utils/get-relation-field-order-by.util';

export const getFieldOrderBy = ({
  groupByFieldMetadata,
  groupBySubFieldName,
  dateGranularity,
  direction,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  groupByFieldMetadata: FlatFieldMetadata;
  groupBySubFieldName: string | null | undefined;
  dateGranularity: ObjectRecordGroupByDateGranularity | undefined;
  direction: OrderByDirection;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Array<
  | ObjectRecordOrderByForScalarField
  | ObjectRecordOrderByWithGroupByDateField
  | ObjectRecordOrderByForCompositeField
  | ObjectRecordOrderByForRelationField
> => {
  if (isCompositeFieldMetadataType(groupByFieldMetadata.type)) {
    if (!isDefined(groupBySubFieldName)) {
      throw new Error(
        `Group by subFieldName is required for composite fields (field: ${groupByFieldMetadata.name})`,
      );
    }

    return [
      {
        [groupByFieldMetadata.name]: {
          [groupBySubFieldName]: direction,
        },
      },
    ];
  }

  if (isFieldMetadataDateKind(groupByFieldMetadata.type)) {
    return [
      {
        [groupByFieldMetadata.name]: {
          orderBy: direction,
          granularity: dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY,
        },
      },
    ];
  }

  if (isMorphOrRelationFlatFieldMetadata(groupByFieldMetadata)) {
    return getRelationFieldOrderBy({
      groupByFieldMetadata,
      groupBySubFieldName,
      direction,
      dateGranularity,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  return [
    {
      [groupByFieldMetadata.name]: direction,
    },
  ];
};
