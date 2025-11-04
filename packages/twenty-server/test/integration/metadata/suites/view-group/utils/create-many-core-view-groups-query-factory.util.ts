import gql from 'graphql-tag';
import { VIEW_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';

export const createManyCoreViewGroupsQueryFactory = ({
  gqlFields = VIEW_GROUP_GQL_FIELDS,
  inputs,
}: {
  gqlFields?: string;
  inputs: CreateViewGroupInput[];
}) => ({
  query: gql`
    mutation CreateManyCoreViewGroups($inputs: [CreateViewGroupInput!]!) {
      createManyCoreViewGroups(inputs: $inputs) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    inputs,
  },
});
