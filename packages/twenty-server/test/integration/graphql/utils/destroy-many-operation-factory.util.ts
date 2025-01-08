import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared';

type DestroyManyOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  gqlFields: string;
  filter?: object;
};

export const destroyManyOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  gqlFields,
  filter = {},
}: DestroyManyOperationFactoryParams) => ({
  query: gql`
    mutation Destroy${capitalize(objectMetadataPluralName)}(
      $filter: ${capitalize(objectMetadataSingularName)}FilterInput
    ) {
      destroy${capitalize(objectMetadataPluralName)}(filter: $filter) {
        ${gqlFields}
      }
  }
  `,
  variables: {
    filter,
  },
});
