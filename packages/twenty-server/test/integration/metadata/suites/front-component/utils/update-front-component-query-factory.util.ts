import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/update-front-component.input';

export type UpdateFrontComponentFactoryInput = UpdateFrontComponentInput;

const DEFAULT_FRONT_COMPONENT_GQL_FIELDS = `
  id
  name
  applicationId
  createdAt
  updatedAt
`;

export const updateFrontComponentQueryFactory = ({
  gqlFields = DEFAULT_FRONT_COMPONENT_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<UpdateFrontComponentFactoryInput>) => ({
  query: gql`
    mutation UpdateFrontComponent($input: UpdateFrontComponentInput!) {
      updateFrontComponent(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
