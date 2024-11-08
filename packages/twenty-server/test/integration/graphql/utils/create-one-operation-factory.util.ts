import gql from 'graphql-tag';

import { capitalize } from 'src/utils/capitalize';

type CreateOneOperationFactoryParams = {
  objectMetadataSingularName: string;
  gqlFields: string;
  data?: object;
};

export const createOneOperationFactory = ({
  objectMetadataSingularName,
  gqlFields,
  data = {},
}: CreateOneOperationFactoryParams) => ({
  query: gql`
    mutation Create${capitalize(objectMetadataSingularName)}($data: ${capitalize(objectMetadataSingularName)}CreateInput) {
    create${capitalize(objectMetadataSingularName)}(data: $data) {
      ${gqlFields}
    }
  }
  `,
  variables: {
    data,
  },
});
