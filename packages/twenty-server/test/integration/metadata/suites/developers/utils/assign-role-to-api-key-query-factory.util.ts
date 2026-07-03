import gql from 'graphql-tag';

export type AssignRoleToApiKeyInput = {
  apiKeyId: string;
  roleId: string;
};

export const assignRoleToApiKeyQueryFactory = ({
  input,
}: {
  input: AssignRoleToApiKeyInput;
}) => ({
  query: gql`
    mutation AssignRoleToApiKey($apiKeyId: UUID!, $roleId: UUID!) {
      assignRoleToApiKey(apiKeyId: $apiKeyId, roleId: $roleId)
    }
  `,
  variables: {
    apiKeyId: input.apiKeyId,
    roleId: input.roleId,
  },
});
