import gql from 'graphql-tag';
import { VIEW_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type UpsertViewWidgetInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget.input';

export const upsertViewWidgetQueryFactory = ({
  gqlFields = VIEW_GQL_FIELDS,
  input,
}: {
  gqlFields?: string;
  input: UpsertViewWidgetInput;
}) => ({
  query: gql`
    mutation UpsertViewWidget($input: UpsertViewWidgetInput!) {
      upsertViewWidget(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
