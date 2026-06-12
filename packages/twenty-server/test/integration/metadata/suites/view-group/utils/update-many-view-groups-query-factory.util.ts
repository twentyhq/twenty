import gql from 'graphql-tag';
import { VIEW_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type UpdateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/update-view-group.input';

export const updateManyViewGroupsQueryFactory = ({
  gqlFields = VIEW_GROUP_GQL_FIELDS,
  inputs,
}: {
  gqlFields?: string;
  inputs: UpdateViewGroupInput[];
}) => ({
  query: gql`
    mutation UpdateManyViewGroups($inputs: [UpdateViewGroupInput!]!) {
      updateManyViewGroups(inputs: $inputs) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    inputs,
  },
});
