import gql from 'graphql-tag';

export const createRoleOperation = ({
  label,
  description,
  canUpdateAllSettings,
  canReadAllObjectRecords,
  canDestroyAllObjectRecords,
  canUpdateAllObjectRecords,
  canSoftDeleteAllObjectRecords,
}: {
  label: string;
  description: string;
  canUpdateAllSettings: boolean;
  canReadAllObjectRecords: boolean;
  canDestroyAllObjectRecords: boolean;
  canUpdateAllObjectRecords: boolean;
  canSoftDeleteAllObjectRecords: boolean;
}) => ({
  query: gql`
    mutation CreateOneRole($createRoleInput: CreateRoleInput!) {
      createOneRole(createRoleInput: $createRoleInput) {
        id
        label
      }
    }
  `,
  variables: {
    createRoleInput: {
      label,
      description,
      canUpdateAllSettings,
      canReadAllObjectRecords,
      canUpdateAllObjectRecords,
      canSoftDeleteAllObjectRecords,
      canDestroyAllObjectRecords,
    },
  },
});
