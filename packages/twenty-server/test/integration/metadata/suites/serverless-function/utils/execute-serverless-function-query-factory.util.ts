import gql from 'graphql-tag';

export type ExecuteServerlessFunctionFactoryInput = {
  id: string;
  payload: Record<string, unknown>;
  version?: string;
};

const DEFAULT_EXECUTION_RESULT_GQL_FIELDS = `
  data
  logs
  duration
  status
  error
`;

export const executeServerlessFunctionQueryFactory = ({
  input,
  gqlFields = DEFAULT_EXECUTION_RESULT_GQL_FIELDS,
}: {
  input: ExecuteServerlessFunctionFactoryInput;
  gqlFields?: string;
}) => ({
  query: gql`
    mutation ExecuteOneServerlessFunction($input: ExecuteServerlessFunctionInput!) {
      executeOneServerlessFunction(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: {
      ...input,
      version: input.version ?? 'latest',
    },
  },
});
