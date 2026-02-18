import {
  type AggregateOperations,
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
import { buildAggregateFieldKey } from 'src/modules/dashboard/chart-data/utils/build-aggregate-field-key.util';
import { getFieldOrderBy } from 'src/modules/dashboard/chart-data/utils/get-field-order-by.util';
import { mapOrderByToDirection } from 'src/modules/dashboard/chart-data/utils/map-order-by-to-direction.util';

export const getGroupByOrderBy = ({
  graphOrderBy,
  groupByFieldMetadata,
  groupBySubFieldName,
  aggregateOperation,
  aggregateFieldMetadata,
  dateGranularity,
}: {
  graphOrderBy: GraphOrderBy;
  groupByFieldMetadata: FlatFieldMetadata;
  groupBySubFieldName?: string | null;
  aggregateOperation?: AggregateOperations;
  aggregateFieldMetadata?: FlatFieldMetadata;
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
      if (
        !isDefined(aggregateOperation) ||
        !isDefined(aggregateFieldMetadata)
      ) {
        throw new Error(
          `Aggregate operation or field metadata not found (field: ${groupByFieldMetadata.name})`,
        );
      }

      const aggregateFieldKey = buildAggregateFieldKey({
        aggregateOperation,
        aggregateFieldMetadata,
      });

      return {
        aggregate: {
          [aggregateFieldKey]: mapOrderByToDirection(graphOrderBy),
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
