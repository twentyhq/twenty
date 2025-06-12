import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type FindManyOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  gqlFields: string;
  filter?: object;
  orderBy?: object;
  limit?: number;
  after?: string;
  before?: string;
  first?: number;
  last?: number;
};

export const findManyOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  gqlFields,
  filter = {},
  orderBy = {},
  limit,
  after,
  before,
  first,
  last,
}: FindManyOperationFactoryParams) => ({
  query: gql`
    query ${capitalize(objectMetadataPluralName)}($filter: ${capitalize(objectMetadataSingularName)}FilterInput, $orderBy: [${capitalize(objectMetadataSingularName)}OrderByInput], $limit: Int, $after: String, $before: String, $first: Int, $last: Int) {
      ${objectMetadataPluralName}(filter: $filter, orderBy: $orderBy, limit: $limit, after: $after, before: $before, first: $first, last: $last) {
        edges {
          node {
            ${gqlFields}
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  `,
  variables: {
    filter,
    orderBy,
    limit,
    after,
    before,
    first,
    last,
  },
});
