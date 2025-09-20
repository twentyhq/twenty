import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type FindManyOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  gqlFields: string;
  filter?: object;
  orderBy?: object;
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
  after,
  before,
  first,
  last,
}: FindManyOperationFactoryParams) => ({
  query: gql`
    query ${capitalize(objectMetadataPluralName)}($filter: ${capitalize(objectMetadataSingularName)}FilterInput, $orderBy: [${capitalize(objectMetadataSingularName)}OrderByInput], $after: String, $before: String, $first: Int, $last: Int) {
      ${objectMetadataPluralName}(filter: $filter, orderBy: $orderBy, after: $after, before: $before, first: $first, last: $last) {
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
    after,
    before,
    first,
    last,
  },
});
