import {
  type AggregateOrderByWithGroupByField,
  type ObjectRecordGroupByDateGranularity,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForRelationField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { getFieldOrderBy } from 'src/modules/dashboard/chart-data/utils/get-field-order-by.util';
import { mapOrderByToDirection } from 'src/modules/dashboard/chart-data/utils/map-order-by-to-direction.util';

export const getGroupByOrderBy = ({
  graphOrderBy,
  groupByFieldMetadata,
  groupBySubFieldName,
  aggregateOperation,
  dateGranularity,
}: {
  graphOrderBy: GraphOrderBy;
  groupByFieldMetadata: FlatFieldMetadata;
  groupBySubFieldName?: string | null;
  aggregateOperation?: string;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
}):
  | AggregateOrderByWithGroupByField
  | ObjectRecordOrderByForScalarField
  | ObjectRecordOrderByWithGroupByDateField
  | ObjectRecordOrderByForCompositeField
  | ObjectRecordOrderByForRelationField
  | undefined => {
  switch (graphOrderBy) {
    case GraphOrderBy.FIELD_ASC:
    case GraphOrderBy.FIELD_DESC:
      return getFieldOrderBy(
        groupByFieldMetadata,
        groupBySubFieldName,
        dateGranularity,
        mapOrderByToDirection(graphOrderBy),
      );
    case GraphOrderBy.VALUE_ASC:
    case GraphOrderBy.VALUE_DESC: {
      if (!isDefined(aggregateOperation)) {
        throw new Error(
          `Aggregate operation not found (field: ${groupByFieldMetadata.name})`,
        );
      }

      return {
        aggregate: {
          [aggregateOperation]: mapOrderByToDirection(graphOrderBy),
        },
      };
    }
    case GraphOrderBy.FIELD_POSITION_ASC:
    case GraphOrderBy.FIELD_POSITION_DESC:
    case GraphOrderBy.MANUAL:
      return undefined;
    default:
      assertUnreachable(graphOrderBy);
  }
};
