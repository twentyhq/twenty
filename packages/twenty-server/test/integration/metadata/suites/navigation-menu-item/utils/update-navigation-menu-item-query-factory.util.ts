import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateOneNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';

export type UpdateNavigationMenuItemFactoryInput =
  UpdateOneNavigationMenuItemInput;

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

export const updateNavigationMenuItemQueryFactory = ({
  input,
  gqlFields = DEFAULT_NAVIGATION_MENU_ITEM_GQL_FIELDS,
}: PerformMetadataQueryParams<UpdateNavigationMenuItemFactoryInput>) => ({
  query: gql`
    mutation UpdateNavigationMenuItem($input: UpdateOneNavigationMenuItemInput!) {
      updateNavigationMenuItem(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
