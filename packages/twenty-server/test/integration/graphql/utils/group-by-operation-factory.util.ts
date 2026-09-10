import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type GroupByOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  orderByForRecords?: object[];
  groupBy: object[];
  filter?: object;
  orderBy?: object[];
  viewId?: string;
  gqlFields?: string;
  limit?: number;
  offsetForRecords?: number;
};

export const groupByOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  groupBy,
  filter = {},
  orderBy = [],
  orderByForRecords = [],
  viewId,
  gqlFields,
  limit,
  offsetForRecords,
}: GroupByOperationFactoryParams) => ({
  query: gql`
    query ${capitalize(objectMetadataPluralName)}GroupBy($groupBy: [${capitalize(objectMetadataSingularName)}GroupByInput!]!, $filter: ${capitalize(objectMetadataSingularName)}FilterInput, $orderBy: [${capitalize(objectMetadataSingularName)}OrderByWithGroupByInput!], $orderByForRecords: [${capitalize(objectMetadataSingularName)}OrderByInput!], $viewId: UUID, $limit: Int, $offsetForRecords: Int) {
      ${objectMetadataPluralName}GroupBy(groupBy: $groupBy, filter: $filter, orderBy: $orderBy, orderByForRecords: $orderByForRecords, viewId: $viewId, limit: $limit, offsetForRecords: $offsetForRecords) {
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
    orderByForRecords,
    limit,
    offsetForRecords,
    ...(viewId && { viewId }),
  },
});
