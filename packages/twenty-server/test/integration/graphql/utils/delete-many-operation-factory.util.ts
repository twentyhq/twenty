import gql from 'graphql-tag';

import { capitalize } from 'src/utils/capitalize';

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
