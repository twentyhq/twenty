import gql from 'graphql-tag';

import { type UpdateOneNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';

const DEFAULT_NAVIGATION_MENU_ITEM_GQL_FIELDS = `
  id
  type
  userWorkspaceId
  targetRecordId
  targetObjectMetadataId
  folderId
  position
  applicationId
  createdAt
  updatedAt
`;

export const updateManyNavigationMenuItemsQueryFactory = ({
  inputs,
  gqlFields = DEFAULT_NAVIGATION_MENU_ITEM_GQL_FIELDS,
}: {
  inputs: UpdateOneNavigationMenuItemInput[];
  gqlFields?: string;
}) => ({
  query: gql`
    mutation UpdateManyNavigationMenuItems(
      $inputs: [UpdateOneNavigationMenuItemInput!]!
    ) {
      updateManyNavigationMenuItems(inputs: $inputs) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    inputs,
  },
});
