import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

const DEFAULT_COMMAND_MENU_ITEM_GQL_FIELDS = `
  id
  workflowVersionId
  engineComponentKey
  label
  icon
  isPinned
  availabilityType
  availabilityObjectMetadataId
  payload {
    ... on PathCommandMenuItemPayload {
      path
    }
    ... on ObjectMetadataCommandMenuItemPayload {
      objectMetadataItemId
    }
  }
  applicationId
  createdAt
  updatedAt
`;

export const findCommandMenuItemsQueryFactory = ({
  gqlFields = DEFAULT_COMMAND_MENU_ITEM_GQL_FIELDS,
}: PerformMetadataQueryParams<void>) => ({
  query: gql`
    query CommandMenuItems {
      commandMenuItems {
        ${gqlFields}
      }
    }
  `,
});
