import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteCommandMenuItemFactoryInput = {
  id: string;
};

const DEFAULT_COMMAND_MENU_ITEM_GQL_FIELDS = `
  id
  label
`;

export const deleteCommandMenuItemQueryFactory = ({
  input,
  gqlFields = DEFAULT_COMMAND_MENU_ITEM_GQL_FIELDS,
}: PerformMetadataQueryParams<DeleteCommandMenuItemFactoryInput>) => ({
  query: gql`
    mutation DeleteCommandMenuItem($id: UUID!) {
      deleteCommandMenuItem(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
