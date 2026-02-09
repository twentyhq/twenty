import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateDefaultLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-default-logic-function.input';

export type CreateDefaultLogicFunctionFactoryInput =
  CreateDefaultLogicFunctionInput;

const DEFAULT_LOGIC_FUNCTION_GQL_FIELDS = `
  id
  name
  description
  runtime
  createdAt
  updatedAt
`;

export const createDefaultLogicFunctionQueryFactory = ({
  input,
  gqlFields = DEFAULT_LOGIC_FUNCTION_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateDefaultLogicFunctionFactoryInput>) => ({
  query: gql`
    mutation CreateDefaultOneLogicFunction($input: CreateDefaultLogicFunctionInput!) {
      createDefaultLogicFunction(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
