import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpsertObjectPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input';

export type UpsertObjectPermissionsFactoryInput = UpsertObjectPermissionsInput;

const DEFAULT_OBJECT_PERMISSION_GQL_FIELDS = `
  objectMetadataId
  canReadObjectRecords
  canUpdateObjectRecords
  canSoftDeleteObjectRecords
  canDestroyObjectRecords
`;

export const upsertObjectPermissionsQueryFactory = ({
  input,
  gqlFields = DEFAULT_OBJECT_PERMISSION_GQL_FIELDS,
}: PerformMetadataQueryParams<UpsertObjectPermissionsFactoryInput>) => ({
  query: gql`
    mutation UpsertObjectPermissions(
      $upsertObjectPermissionsInput: UpsertObjectPermissionsInput!
    ) {
      upsertObjectPermissions(
        upsertObjectPermissionsInput: $upsertObjectPermissionsInput
      ) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    upsertObjectPermissionsInput: input,
  },
});
