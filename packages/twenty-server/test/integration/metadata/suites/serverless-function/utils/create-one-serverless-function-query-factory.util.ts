import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';

export type CreateOneServerlessFunctionFactoryInput =
  CreateServerlessFunctionInput;

const DEFAULT_SERVERLESS_FUNCTION_GQL_FIELDS = `
  id
  name
  description
  runtime
  latestVersion
  publishedVersions
  createdAt
  updatedAt
`;

export const createOneServerlessFunctionQueryFactory = ({
  input,
  gqlFields = DEFAULT_SERVERLESS_FUNCTION_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateOneServerlessFunctionFactoryInput>) => ({
  query: gql`
    mutation CreateOneServerlessFunction($input: CreateServerlessFunctionInput!) {
      createOneServerlessFunction(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
