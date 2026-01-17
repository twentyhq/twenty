import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';

export type CreateFrontComponentFactoryInput = CreateFrontComponentInput;

const DEFAULT_FRONT_COMPONENT_GQL_FIELDS = `
  id
  name
  applicationId
  createdAt
  updatedAt
`;

export const createFrontComponentQueryFactory = ({
  input,
  gqlFields = DEFAULT_FRONT_COMPONENT_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateFrontComponentFactoryInput>) => ({
  query: gql`
    mutation CreateFrontComponent($input: CreateFrontComponentInput!) {
      createFrontComponent(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
