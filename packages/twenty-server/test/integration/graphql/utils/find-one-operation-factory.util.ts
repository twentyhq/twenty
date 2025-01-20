import { capitalize } from '@twenty/shared';
import gql from 'graphql-tag';

type FindOneOperationFactoryParams = {
  objectMetadataSingularName: string;
  gqlFields: string;
  filter?: object;
};

export const findOneOperationFactory = ({
  objectMetadataSingularName,
  gqlFields,
  filter = {},
}: FindOneOperationFactoryParams) => ({
  query: gql`
    query ${capitalize(objectMetadataSingularName)}($filter: ${capitalize(objectMetadataSingularName)}FilterInput) {
      ${objectMetadataSingularName}(filter: $filter) {
          ${gqlFields}
      }
    }
  `,
  variables: {
    filter,
  },
});
