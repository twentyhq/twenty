import gql from 'graphql-tag';
import { PAGE_LAYOUT_GQL_FIELDS } from 'test/integration/constants/page-layout-gql-fields.constants';

type FindPageLayoutsOperationFactoryParams = {
  gqlFields?: string;
  objectMetadataId?: string;
};

export const findPageLayoutsOperationFactory = ({
  gqlFields = PAGE_LAYOUT_GQL_FIELDS,
  objectMetadataId,
}: FindPageLayoutsOperationFactoryParams = {}) => ({
  query: gql`
    query GetPageLayouts($objectMetadataId: String) {
      getPageLayouts(objectMetadataId: $objectMetadataId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    objectMetadataId,
  },
});
