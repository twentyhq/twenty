import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type GroupByOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  groupBy: object[];
  filter?: object;
  orderBy?: object[];
  viewId?: string;
  gqlFields?: string;
  omitNullValues?: boolean;
  rangeMin?: number;
  rangeMax?: number;
};

export const groupByOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  groupBy,
  filter = {},
  orderBy = [],
  viewId,
  gqlFields,
  omitNullValues,
  rangeMin,
  rangeMax,
}: GroupByOperationFactoryParams) => ({
  query: gql`
    query ${capitalize(objectMetadataPluralName)}GroupBy($groupBy: [${capitalize(objectMetadataSingularName)}GroupByInput!]!, $filter: ${capitalize(objectMetadataSingularName)}FilterInput, $orderBy: [${capitalize(objectMetadataSingularName)}OrderByWithGroupByInput!], $viewId: UUID, $omitNullValues: Boolean, $rangeMin: Float, $rangeMax: Float) {
      ${objectMetadataPluralName}GroupBy(groupBy: $groupBy, filter: $filter, orderBy: $orderBy, viewId: $viewId, omitNullValues: $omitNullValues, rangeMin: $rangeMin, rangeMax: $rangeMax) {
        ${gqlFields ? gqlFields : ''}
        groupByDimensionValues
        totalCount
      }
    }
  `,
  variables: {
    groupBy,
    filter,
    orderBy,
    ...(viewId && { viewId }),
    omitNullValues: omitNullValues ?? null,
    rangeMin: rangeMin ?? null,
    rangeMax: rangeMax ?? null,
  },
});
