import gql from 'graphql-tag';
import { VIEW_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';

type CreateViewOperationFactoryParams = {
  gqlFields?: string;
  data?: Partial<ViewEntity>;
};

export const createViewOperationFactory = ({
  gqlFields = VIEW_GQL_FIELDS,
  data = {},
}: CreateViewOperationFactoryParams = {}) => ({
  query: gql`
    mutation CreateCoreView($input: CreateViewInput!) {
      createCoreView(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: data,
  },
});
