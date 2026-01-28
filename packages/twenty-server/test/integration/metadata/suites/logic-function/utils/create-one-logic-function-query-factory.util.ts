import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function.input';

export type CreateOneLogicFunctionFactoryInput = CreateLogicFunctionInput;

const DEFAULT_LOGIC_FUNCTION_GQL_FIELDS = `
  id
  name
  description
  runtime
  latestVersion
  publishedVersions
  createdAt
  updatedAt
`;

export const createOneLogicFunctionQueryFactory = ({
  input,
  gqlFields = DEFAULT_LOGIC_FUNCTION_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateOneLogicFunctionFactoryInput>) => ({
  query: gql`
    mutation CreateOneLogicFunction($input: CreateLogicFunctionInput!) {
      createOneLogicFunction(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
