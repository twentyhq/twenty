import gql from 'graphql-tag';

export type ExecuteLogicFunctionFactoryInput = {
  id: string;
  payload: Record<string, unknown>;
};

const DEFAULT_EXECUTION_RESULT_GQL_FIELDS = `
  data
  logs
  duration
  status
  error
`;

export const executeLogicFunctionQueryFactory = ({
  input,
  gqlFields = DEFAULT_EXECUTION_RESULT_GQL_FIELDS,
}: {
  input: ExecuteLogicFunctionFactoryInput;
  gqlFields?: string;
}) => ({
  query: gql`
    mutation ExecuteOneLogicFunction($input: ExecuteOneLogicFunctionInput!) {
      executeOneLogicFunction(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
