import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared';

type UpdateOneOperationFactoryParams = {
  objectMetadataSingularName: string;
  gqlFields: string;
  data?: object;
  recordId: string;
};

export const updateOneOperationFactory = ({
  objectMetadataSingularName,
  gqlFields,
  data = {},
  recordId,
}: UpdateOneOperationFactoryParams) => ({
  query: gql`
    mutation Update${capitalize(objectMetadataSingularName)}($${objectMetadataSingularName}Id: ID, $data: ${capitalize(objectMetadataSingularName)}UpdateInput) {
      update${capitalize(objectMetadataSingularName)}(id: $${objectMetadataSingularName}Id, data: $data) {
        ${gqlFields}
      }
  }
  `,
  variables: {
    data,
    [`${objectMetadataSingularName}Id`]: recordId,
  },
});
