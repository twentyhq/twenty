import gql from 'graphql-tag';

export const createUpsertObjectPermissionsOperation = (
  roleId: string,
  objectPermissions: Array<{
    objectMetadataId: string;
    canReadObjectRecords?: boolean;
    canUpdateObjectRecords?: boolean;
    canSoftDeleteObjectRecords?: boolean;
    canDestroyObjectRecords?: boolean;
  }>,
  selectedFields: string[] = [
    'objectMetadataId',
    'canReadObjectRecords',
    'canUpdateObjectRecords',
    'canSoftDeleteObjectRecords',
    'canDestroyObjectRecords',
  ],
) => ({
  query: gql`
      mutation UpsertObjectPermissions(
        $upsertObjectPermissionsInput: UpsertObjectPermissionsInput!
      ) {
        upsertObjectPermissions(
          upsertObjectPermissionsInput: $upsertObjectPermissionsInput
        ) {
          ${selectedFields.join('\n')}
        }
      }
    `,
  variables: {
    upsertObjectPermissionsInput: {
      roleId,
      objectPermissions,
    },
  },
});
