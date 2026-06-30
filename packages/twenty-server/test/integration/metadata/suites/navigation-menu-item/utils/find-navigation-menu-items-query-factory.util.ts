import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

const DEFAULT_NAVIGATION_MENU_ITEM_GQL_FIELDS = `
  id
  userWorkspaceId
  targetRecordId
  targetObjectMetadataId
  folderId
  position
  applicationId
  createdAt
  updatedAt
`;

export const findNavigationMenuItemsQueryFactory = ({
  gqlFields = DEFAULT_NAVIGATION_MENU_ITEM_GQL_FIELDS,
}: PerformMetadataQueryParams<void>) => ({
  query: gql`
    query NavigationMenuItems {
      navigationMenuItems {
        ${gqlFields}
      }
    }
  `,
});
