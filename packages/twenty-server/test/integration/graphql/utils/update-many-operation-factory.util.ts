import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared';

type UpdateManyOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  gqlFields: string;
  data?: object;
  filter?: object;
};

export const updateManyOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  gqlFields,
  data = {},
  filter = {},
}: UpdateManyOperationFactoryParams) => ({
  query: gql`
    mutation Update${capitalize(objectMetadataPluralName)}(
      $data: ${capitalize(objectMetadataSingularName)}UpdateInput
      $filter: ${capitalize(objectMetadataSingularName)}FilterInput
    ) {
      update${capitalize(objectMetadataPluralName)}(data: $data, filter: $filter) {
        ${gqlFields}
      }
  }
  `,
  variables: {
    data,
    filter,
  },
});
