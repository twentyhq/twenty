import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared';

type DeleteManyOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  gqlFields: string;
  filter?: object;
};

export const deleteManyOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  gqlFields,
  filter = {},
}: DeleteManyOperationFactoryParams) => ({
  query: gql`
    mutation Delete${capitalize(objectMetadataPluralName)}(
      $filter: ${capitalize(objectMetadataSingularName)}FilterInput
    ) {
      delete${capitalize(objectMetadataPluralName)}(filter: $filter) {
        ${gqlFields}
      }
  }
  `,
  variables: {
    filter,
  },
});
