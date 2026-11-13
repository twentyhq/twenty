import gql from 'graphql-tag';
import { VIEW_TAB_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type UpdateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/update-view-tab.input';

export const updateManyViewTabsQueryFactory = ({
  gqlFields = VIEW_TAB_GQL_FIELDS,
  inputs,
}: {
  gqlFields?: string;
  inputs: UpdateViewTabInput[];
}) => ({
  query: gql`
    mutation UpdateManyViewTabs($inputs: [UpdateViewTabInput!]!) {
      updateManyViewTabs(inputs: $inputs) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    inputs,
  },
});
