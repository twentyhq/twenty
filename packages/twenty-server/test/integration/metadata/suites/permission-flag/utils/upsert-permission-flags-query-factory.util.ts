import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpsertPermissionFlagsInput } from 'src/engine/metadata-modules/permission-flag/dtos/upsert-permission-flag-input';

export type UpsertPermissionFlagsFactoryInput = UpsertPermissionFlagsInput;

const DEFAULT_PERMISSION_FLAG_GQL_FIELDS = `
  id
  roleId
  flag
`;

export const upsertPermissionFlagsQueryFactory = ({
  input,
  gqlFields = DEFAULT_PERMISSION_FLAG_GQL_FIELDS,
}: PerformMetadataQueryParams<UpsertPermissionFlagsFactoryInput>) => ({
  query: gql`
    mutation UpsertPermissionFlags($upsertPermissionFlagsInput: UpsertPermissionFlagsInput!) {
      upsertPermissionFlags(upsertPermissionFlagsInput: $upsertPermissionFlagsInput) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    upsertPermissionFlagsInput: input,
  },
});
