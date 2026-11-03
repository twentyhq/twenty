import gql from 'graphql-tag';

export const createApiKeyOperationFactory = ({
  name,
  expiresAt,
  roleId,
}: {
  name: string;
  expiresAt: string;
  roleId: string;
}) => ({
  query: gql`
    mutation CreateApiKey($input: CreateApiKeyInput!) {
      createApiKey(input: $input) {
        id
      }
    }
  `,
  variables: { input: { name, expiresAt, roleId } },
});
