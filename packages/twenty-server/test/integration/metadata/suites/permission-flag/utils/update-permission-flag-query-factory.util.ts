import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdatePermissionFlagInput } from 'src/engine/metadata-modules/permission-flag/dtos/update-permission-flag.input';

export type UpdatePermissionFlagFactoryInput = UpdatePermissionFlagInput;

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

export const updatePermissionFlagQueryFactory = ({
  input,
  gqlFields = DEFAULT_PERMISSION_FLAG_GQL_FIELDS,
}: PerformMetadataQueryParams<UpdatePermissionFlagFactoryInput>) => ({
  query: gql`
    mutation UpdatePermissionFlag($input: UpdatePermissionFlagInput!) {
      updatePermissionFlag(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
