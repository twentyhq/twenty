import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared';

type FindManyOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  gqlFields: string;
  filter?: object;
};

export const findManyOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  gqlFields,
  filter = {},
}: FindManyOperationFactoryParams) => ({
  query: gql`
    query ${capitalize(objectMetadataPluralName)}($filter: ${capitalize(objectMetadataSingularName)}FilterInput) {
      ${objectMetadataPluralName}(filter: $filter) {
        edges {
          node {
            ${gqlFields}
          }
        }
      }
    }
  `,
  variables: {
    filter,
  },
});
