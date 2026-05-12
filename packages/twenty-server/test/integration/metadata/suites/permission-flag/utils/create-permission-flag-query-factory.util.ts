import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreatePermissionFlagInput } from 'src/engine/metadata-modules/permission-flag/dtos/create-permission-flag.input';

export type CreatePermissionFlagFactoryInput = CreatePermissionFlagInput;

const DEFAULT_PERMISSION_FLAG_GQL_FIELDS = `
  id
  universalIdentifier
  key
  label
  description
  iconKey
  permissionType
  isRelevantForAgents
  isRelevantForUsers
  isRelevantForApiKeys
  isCustom
  applicationId
  createdAt
  updatedAt
`;

export const createPermissionFlagQueryFactory = ({
  input,
  gqlFields = DEFAULT_PERMISSION_FLAG_GQL_FIELDS,
}: PerformMetadataQueryParams<CreatePermissionFlagFactoryInput>) => ({
  query: gql`
    mutation CreatePermissionFlag($input: CreatePermissionFlagInput!) {
      createPermissionFlag(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
