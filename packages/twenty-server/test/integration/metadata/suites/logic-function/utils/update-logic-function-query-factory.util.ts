import gql from 'graphql-tag';
import { type Sources } from 'twenty-shared/types';

export type UpdateLogicFunctionFactoryInput = {
  id: string;
  update: {
    name: string;
    description?: string;
    code: Sources;
  };
};

const DEFAULT_LOGIC_FUNCTION_GQL_FIELDS = `
  id
  name
  description
  latestVersion
`;

export const updateLogicFunctionQueryFactory = ({
  input,
  gqlFields = DEFAULT_LOGIC_FUNCTION_GQL_FIELDS,
}: {
  input: UpdateLogicFunctionFactoryInput;
  gqlFields?: string;
}) => ({
  query: gql`
    mutation UpdateOneLogicFunction($input: UpdateLogicFunctionInput!) {
      updateOneLogicFunction(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
