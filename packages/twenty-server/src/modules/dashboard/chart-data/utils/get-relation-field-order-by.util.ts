import {
  type ObjectRecordGroupByDateGranularity,
  type ObjectRecordOrderByForRelationField,
  type ObjectRecordOrderByForScalarField,
  type OrderByDirection,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from 'src/modules/dashboard/chart-data/constants/graph-default-date-granularity.constant';

export const getRelationFieldOrderBy = (
  groupByFieldMetadata: FlatFieldMetadata,
  groupBySubFieldName: string | null | undefined,
  direction: OrderByDirection,
  dateGranularity?: ObjectRecordGroupByDateGranularity,
  isNestedDateField?: boolean,
): ObjectRecordOrderByForScalarField | ObjectRecordOrderByForRelationField => {
  if (!isDefined(groupBySubFieldName)) {
    return {
      [`${groupByFieldMetadata.name}Id`]: direction,
    };
  }

  const [nestedFieldName, nestedSubFieldName] = groupBySubFieldName.split('.');

  if (isNestedDateField === true || isDefined(dateGranularity)) {
    return {
      [groupByFieldMetadata.name]: {
        [nestedFieldName]: {
          orderBy: direction,
          granularity: dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY,
        },
      },
    };
  }

  if (!isDefined(nestedSubFieldName)) {
    return {
      [groupByFieldMetadata.name]: {
        [nestedFieldName]: direction,
      },
    };
  }

  return {
    [groupByFieldMetadata.name]: {
      [nestedFieldName]: {
        [nestedSubFieldName]: direction,
      },
    },
  };
};
