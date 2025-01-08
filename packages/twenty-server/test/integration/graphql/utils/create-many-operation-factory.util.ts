import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared';

type CreateManyOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  gqlFields: string;
  data?: object;
};

export const createManyOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  gqlFields,
  data = {},
}: CreateManyOperationFactoryParams) => ({
  query: gql`
    mutation Create${capitalize(objectMetadataSingularName)}($data: [${capitalize(objectMetadataSingularName)}CreateInput!]!) {
    create${capitalize(objectMetadataPluralName)}(data: $data) {
      ${gqlFields}
    }
  }
  `,
  variables: {
    data,
  },
});
