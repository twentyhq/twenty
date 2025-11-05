import gql from 'graphql-tag';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';

export const createManyCoreViewFieldsQueryFactory = ({
  gqlFields = VIEW_FIELD_GQL_FIELDS,
  inputs,
}: {
  gqlFields?: string;
  inputs: CreateViewFieldInput[];
}) => ({
  query: gql`
    mutation CreateManyCoreViewFields($inputs: [CreateViewFieldInput!]!) {
      createManyCoreViewFields(inputs: $inputs) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    inputs,
  },
});
