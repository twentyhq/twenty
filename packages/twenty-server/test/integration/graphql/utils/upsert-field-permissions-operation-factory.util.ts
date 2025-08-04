import gql from 'graphql-tag';

export const createUpsertFieldPermissionsOperation = (
  roleId: string,
  fieldPermissions: Array<{
    objectMetadataId: string;
    fieldMetadataId: string;
    canReadFieldValue?: boolean | null;
    canUpdateFieldValue?: boolean | null;
  }>,
  selectedFields: string[] = [
    'id',
    'roleId',
    'objectMetadataId',
    'fieldMetadataId',
    'canReadFieldValue',
    'canUpdateFieldValue',
  ],
) => ({
  query: gql`
      mutation UpsertFieldPermissions(
        $roleId: UUID!
        $fieldPermissions: [FieldPermissionInput!]!
      ) {
        upsertFieldPermissions(
          upsertFieldPermissionsInput: {
            roleId: $roleId
            fieldPermissions: $fieldPermissions
          }
        ) {
          ${selectedFields.join('\n')}
        }
      }
    `,
  variables: {
    roleId,
    fieldPermissions,
  },
});
