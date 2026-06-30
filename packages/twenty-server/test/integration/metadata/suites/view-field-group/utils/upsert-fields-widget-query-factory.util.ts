import gql from 'graphql-tag';
import { VIEW_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type UpsertFieldsWidgetInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/upsert-fields-widget.input';

export const upsertFieldsWidgetQueryFactory = ({
  gqlFields = VIEW_GQL_FIELDS,
  input,
}: {
  gqlFields?: string;
  input: UpsertFieldsWidgetInput;
}) => ({
  query: gql`
    mutation UpsertFieldsWidget($input: UpsertFieldsWidgetInput!) {
      upsertFieldsWidget(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
