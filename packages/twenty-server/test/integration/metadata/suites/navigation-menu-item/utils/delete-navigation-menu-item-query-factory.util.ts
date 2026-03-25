import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteNavigationMenuItemFactoryInput = {
  id: string;
};

const DEFAULT_NAVIGATION_MENU_ITEM_GQL_FIELDS = `
  id
  targetRecordId
  position
`;

export const deleteNavigationMenuItemQueryFactory = ({
  input,
  gqlFields = DEFAULT_NAVIGATION_MENU_ITEM_GQL_FIELDS,
}: PerformMetadataQueryParams<DeleteNavigationMenuItemFactoryInput>) => ({
  query: gql`
    mutation DeleteNavigationMenuItem($id: UUID!) {
      deleteNavigationMenuItem(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
