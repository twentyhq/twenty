import gql from 'graphql-tag';

export const revokeApiKeyOperationFactory = ({
  apiKeyId,
}: {
  apiKeyId: string;
}) => ({
  query: gql`
    mutation RevokeApiKey($input: RevokeApiKeyInput!) {
      revokeApiKey(input: $input) {
        id
      }
    }
  `,
  variables: { input: { id: apiKeyId } },
});
