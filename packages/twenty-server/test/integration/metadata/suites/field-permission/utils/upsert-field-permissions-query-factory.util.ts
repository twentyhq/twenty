import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';

export type UpsertFieldPermissionsFactoryInput = UpsertFieldPermissionsInput;

const DEFAULT_FIELD_PERMISSION_GQL_FIELDS = `
  id
  objectMetadataId
  fieldMetadataId
  roleId
  canReadFieldValue
  canUpdateFieldValue
`;

export const upsertFieldPermissionsQueryFactory = ({
  input,
  gqlFields = DEFAULT_FIELD_PERMISSION_GQL_FIELDS,
}: PerformMetadataQueryParams<UpsertFieldPermissionsFactoryInput>) => ({
  query: gql`
    mutation UpsertFieldPermissions(
      $upsertFieldPermissionsInput: UpsertFieldPermissionsInput!
    ) {
      upsertFieldPermissions(
        upsertFieldPermissionsInput: $upsertFieldPermissionsInput
      ) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    upsertFieldPermissionsInput: input,
  },
});
