import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';

type CreateViewSortOperationFactoryParams = {
  gqlFields?: string;
  data?: Partial<ViewSortEntity>;
};

export const createViewSortOperationFactory = ({
  gqlFields = VIEW_SORT_GQL_FIELDS,
  data = {},
}: CreateViewSortOperationFactoryParams = {}) => ({
  query: gql`
    mutation CreateCoreViewSort($input: CreateViewSortInput!) {
      createCoreViewSort(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: data,
  },
});
