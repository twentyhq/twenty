import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

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

export const findPermissionFlagsQueryFactory = ({
  gqlFields = DEFAULT_PERMISSION_FLAG_GQL_FIELDS,
}: PerformMetadataQueryParams<void>) => ({
  query: gql`
    query PermissionFlags {
      permissionFlags {
        ${gqlFields}
      }
    }
  `,
});
