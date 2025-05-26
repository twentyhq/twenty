import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

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
    mutation CreateOne${capitalize(objectMetadataSingularName)}($input: ${capitalize(objectMetadataSingularName)}CreateInput!) {
    create${capitalize(objectMetadataSingularName)}(data: $input) {
      ${gqlFields}
    }
  }
  `,
  variables: {
    input: data,
  },
});
