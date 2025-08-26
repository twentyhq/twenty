import gql from 'graphql-tag';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';

type CreateViewFieldOperationFactoryParams = {
  gqlFields?: string;
  data?: Partial<ViewFieldEntity>;
};

export const createViewFieldOperationFactory = ({
  gqlFields = VIEW_FIELD_GQL_FIELDS,
  data = {},
}: CreateViewFieldOperationFactoryParams = {}) => ({
  query: gql`
    mutation CreateCoreViewField($input: CreateViewFieldInput!) {
      createCoreViewField(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: data,
  },
});
