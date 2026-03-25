import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';

export type CreateNavigationMenuItemFactoryInput =
  CreateNavigationMenuItemInput;

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

export const createNavigationMenuItemQueryFactory = ({
  input,
  gqlFields = DEFAULT_NAVIGATION_MENU_ITEM_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateNavigationMenuItemFactoryInput>) => ({
  query: gql`
    mutation CreateNavigationMenuItem($input: CreateNavigationMenuItemInput!) {
      createNavigationMenuItem(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
