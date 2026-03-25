import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

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
    mutation Update${capitalize(objectMetadataSingularName)}($${objectMetadataSingularName}Id: UUID!, $data: ${capitalize(objectMetadataSingularName)}UpdateInput!) {
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
