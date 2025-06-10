import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type FindOneOperationFactoryParams = {
  objectMetadataSingularName: string;
  gqlFields: string;
  filter?: unknown;
};

export const findOneOperationFactory = ({
  objectMetadataSingularName,
  gqlFields,
  filter = {},
}: FindOneOperationFactoryParams) => ({
  query: gql`
    query FindOne${capitalize(objectMetadataSingularName)}($filter: ${capitalize(objectMetadataSingularName)}FilterInput!) {
      ${objectMetadataSingularName}(filter: $filter) {
          ${gqlFields}
      }
    }
  `,
  variables: {
    filter,
  },
});
