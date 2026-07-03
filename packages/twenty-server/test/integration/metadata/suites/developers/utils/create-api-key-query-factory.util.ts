import gql from 'graphql-tag';

export type CreateApiKeyInput = {
  name: string;
  expiresAt: string;
  roleId: string;
  revokedAt?: string;
};

const DEFAULT_API_KEY_GQL_FIELDS = `
  id
  name
  expiresAt
  revokedAt
  role {
    id
    label
  }
`;

export const createApiKeyQueryFactory = ({
  input,
  gqlFields = DEFAULT_API_KEY_GQL_FIELDS,
}: {
  input: CreateApiKeyInput;
  gqlFields?: string;
}) => ({
  query: gql`
    mutation CreateApiKey($input: CreateApiKeyInput!) {
      createApiKey(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
