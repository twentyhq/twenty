import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type CreateManyOperationFactoryParams = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  gqlFields: string;
  data?: object;
  upsert?: boolean;
};

export const createManyOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  gqlFields,
  data = {},
  upsert = false,
}: CreateManyOperationFactoryParams) => ({
  query: gql`
    mutation Create${capitalize(objectMetadataSingularName)}($data: [${capitalize(objectMetadataSingularName)}CreateInput!]!, $upsert: Boolean) {
    create${capitalize(objectMetadataPluralName)}(data: $data, upsert: $upsert) {
      ${gqlFields}
    }
  }
  `,
  variables: {
    data,
    upsert,
  },
});
