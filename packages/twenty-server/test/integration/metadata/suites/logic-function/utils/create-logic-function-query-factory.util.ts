import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateLogicFunctionFromSourceInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function-from-source.input';

export type CreateLogicFunctionFactoryInput =
  CreateLogicFunctionFromSourceInput;

const LOGIC_FUNCTION_GQL_FIELDS = `
  id
  name
  description
  runtime
  createdAt
  updatedAt
`;

export const createOneLogicFunctionQueryFactory = ({
  input,
  gqlFields = LOGIC_FUNCTION_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateLogicFunctionFactoryInput>) => ({
  query: gql`
    mutation CreateOneLogicFunction($input: CreateLogicFunctionFromSourceInput!) {
      createOneLogicFunction(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
