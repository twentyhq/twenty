import gql from 'graphql-tag';

import { capitalize } from 'src/utils/capitalize';

type UpdateOneOperationFactoryParams = {
  objectMetadataSingularName: string;
  gqlFields: string;
  data?: object;
};

export const updateOneOperationFactory = ({
  objectMetadataSingularName,
  gqlFields,
  data = {},
}: UpdateOneOperationFactoryParams) => ({
  query: gql`
    mutation Update${capitalize(objectMetadataSingularName)}($${objectMetadataSingularName}Id: ID, $data: ${objectMetadataSingularName}UpdateInput) {
      update${capitalize(objectMetadataSingularName)}(id: $${objectMetadataSingularName}Id, data: $data) {
        ${gqlFields}
      }
  }
  `,
  variables: {
    data,
  },
});
