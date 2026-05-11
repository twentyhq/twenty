import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpsertPermissionFlagGrantsInput } from 'src/engine/metadata-modules/permission-flag-grant/dtos/upsert-permission-flag-grant-input';

export type UpsertPermissionFlagGrantsFactoryInput = UpsertPermissionFlagGrantsInput;

const DEFAULT_PERMISSION_FLAG_GRANT_GQL_FIELDS = `
  id
  roleId
  flag
`;

export const upsertPermissionFlagGrantsQueryFactory = ({
  input,
  gqlFields = DEFAULT_PERMISSION_FLAG_GRANT_GQL_FIELDS,
}: PerformMetadataQueryParams<UpsertPermissionFlagGrantsFactoryInput>) => ({
  query: gql`
    mutation UpsertPermissionFlagGrants($upsertPermissionFlagGrantsInput: UpsertPermissionFlagGrantsInput!) {
      upsertPermissionFlagGrants(upsertPermissionFlagGrantsInput: $upsertPermissionFlagGrantsInput) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    upsertPermissionFlagGrantsInput: input,
  },
});
