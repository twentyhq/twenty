import gql from 'graphql-tag';

import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';

const DEFAULT_NAVIGATION_MENU_ITEM_GQL_FIELDS = `
  id
  type
  userWorkspaceId
  targetRecordId
  targetObjectMetadataId
  viewId
  folderId
  position
  name
  link
  icon
  color
  applicationId
  createdAt
  updatedAt
`;

export const createManyNavigationMenuItemsQueryFactory = ({
  inputs,
  gqlFields = DEFAULT_NAVIGATION_MENU_ITEM_GQL_FIELDS,
}: {
  inputs: CreateNavigationMenuItemInput[];
  gqlFields?: string;
}) => ({
  query: gql`
    mutation CreateManyNavigationMenuItems(
      $inputs: [CreateNavigationMenuItemInput!]!
    ) {
      createManyNavigationMenuItems(inputs: $inputs) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    inputs,
  },
});
