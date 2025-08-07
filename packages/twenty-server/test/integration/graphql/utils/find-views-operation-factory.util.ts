import gql from 'graphql-tag';
import { VIEW_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findViewsOperationFactory = ({
  gqlFields = VIEW_GQL_FIELDS,
  objectMetadataId,
}: {
  gqlFields?: string;
  objectMetadataId?: string;
} = {}) => ({
  query: gql`
    query GetCoreViews($objectMetadataId: String) {
      getCoreViews(objectMetadataId: $objectMetadataId) {
        ${gqlFields}
      }
    }
  `,
  variables: objectMetadataId ? { objectMetadataId } : {},
});
