import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role-input.dto';

export type CreateOneRoleFactoryInput = CreateRoleInput;

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

export const createOneRoleQueryFactory = ({
  input,
  gqlFields = DEFAULT_ROLE_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateOneRoleFactoryInput>) => ({
  query: gql`
        mutation CreateOneRole($createRoleInput: CreateRoleInput!) {
          createOneRole(createRoleInput: $createRoleInput) {
            ${gqlFields}
          }
        }
      `,
  variables: {
    createRoleInput: input,
  },
});
