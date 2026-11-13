import gql from 'graphql-tag';
import { VIEW_TAB_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type CreateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/create-view-tab.input';

export const createManyViewTabsQueryFactory = ({
  gqlFields = VIEW_TAB_GQL_FIELDS,
  inputs,
}: {
  gqlFields?: string;
  inputs: CreateViewTabInput[];
}) => ({
  query: gql`
    mutation CreateManyViewTabs($inputs: [CreateViewTabInput!]!) {
      createManyViewTabs(inputs: $inputs) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    inputs,
  },
});
