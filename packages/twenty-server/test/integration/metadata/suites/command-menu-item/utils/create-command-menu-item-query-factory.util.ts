import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';

export type CreateCommandMenuItemFactoryInput = CreateCommandMenuItemInput;

const DEFAULT_COMMAND_MENU_ITEM_GQL_FIELDS = `
  id
  workflowVersionId
  label
  icon
  isPinned
  availabilityType
  availabilityObjectMetadataId
  applicationId
  createdAt
  updatedAt
`;

export const createCommandMenuItemQueryFactory = ({
  input,
  gqlFields = DEFAULT_COMMAND_MENU_ITEM_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateCommandMenuItemFactoryInput>) => ({
  query: gql`
    mutation CreateCommandMenuItem($input: CreateCommandMenuItemInput!) {
      createCommandMenuItem(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
