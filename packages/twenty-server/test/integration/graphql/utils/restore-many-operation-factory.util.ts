import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type RestoreManyOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  gqlFields: string;
  filter: object;
};

export const restoreManyOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  gqlFields,
  filter,
}: RestoreManyOperationFactoryParams) => ({
  query: gql`
    mutation Restore${capitalize(objectMetadataPluralName)}($filter: ${capitalize(objectMetadataSingularName)}FilterInput!) {
      restore${capitalize(objectMetadataPluralName)}(filter: $filter) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    filter,
  },
});
