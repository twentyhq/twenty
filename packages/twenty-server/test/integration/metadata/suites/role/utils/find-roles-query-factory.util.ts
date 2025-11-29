import gql from 'graphql-tag';

const DEFAULT_ROLE_GQL_FIELDS = `
  id
  label
  description
  icon
  isEditable
  canUpdateAllSettings
  canAccessAllTools
  canReadAllObjectRecords
  canUpdateAllObjectRecords
  canSoftDeleteAllObjectRecords
  canDestroyAllObjectRecords
  canBeAssignedToUsers
  canBeAssignedToAgents
  canBeAssignedToApiKeys
`;

export const findRolesQueryFactory = ({
  gqlFields = DEFAULT_ROLE_GQL_FIELDS,
}: {
  gqlFields?: string;
} = {}) => ({
  query: gql`
    query GetRoles {
      getRoles {
        ${gqlFields}
      }
    }
  `,
  variables: {},
});
