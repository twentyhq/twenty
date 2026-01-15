import gql from 'graphql-tag';

import { type Sources } from 'twenty-shared/types';

export type UpdateServerlessFunctionFactoryInput = {
  id: string;
  update: {
    name?: string;
    description?: string;
    code: Sources;
  };
};

const DEFAULT_SERVERLESS_FUNCTION_GQL_FIELDS = `
  id
  name
  description
  latestVersion
`;

export const updateServerlessFunctionQueryFactory = ({
  input,
  gqlFields = DEFAULT_SERVERLESS_FUNCTION_GQL_FIELDS,
}: {
  input: UpdateServerlessFunctionFactoryInput;
  gqlFields?: string;
}) => ({
  query: gql`
    mutation UpdateOneServerlessFunction($input: UpdateServerlessFunctionInput!) {
      updateOneServerlessFunction(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});

