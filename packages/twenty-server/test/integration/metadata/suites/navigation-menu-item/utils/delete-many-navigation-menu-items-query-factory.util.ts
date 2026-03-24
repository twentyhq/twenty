import gql from 'graphql-tag';

const DEFAULT_NAVIGATION_MENU_ITEM_GQL_FIELDS = `
  id
  type
  targetRecordId
  targetObjectMetadataId
  position
`;

export const deleteManyNavigationMenuItemsQueryFactory = ({
  ids,
  gqlFields = DEFAULT_NAVIGATION_MENU_ITEM_GQL_FIELDS,
}: {
  ids: string[];
  gqlFields?: string;
}) => ({
  query: gql`
    mutation DeleteManyNavigationMenuItems($ids: [UUID!]!) {
      deleteManyNavigationMenuItems(ids: $ids) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    ids,
  },
});
