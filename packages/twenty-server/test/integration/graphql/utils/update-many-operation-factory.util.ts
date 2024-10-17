import gql from 'graphql-tag';

import { capitalize } from 'src/utils/capitalize';

type UpdateManyOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  gqlFields: string;
  data?: object;
};

export const updateManyOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  gqlFields,
  data = {},
}: UpdateManyOperationFactoryParams) => ({
  query: gql`
    mutation Update${capitalize(objectMetadataPluralName)}(
      $data: ${objectMetadataSingularName}UpdateInput
      $filter: ${objectMetadataSingularName}FilterInput
    ) {
      update${capitalize(objectMetadataPluralName)}(data: $data, filter: $filter) {
        ${gqlFields}
      }
  }
  `,
  variables: {
    data,
  },
});
