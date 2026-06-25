import gql from 'graphql-tag';
import { VIEW_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findViewsQueryFactory = ({
  gqlFields = VIEW_GQL_FIELDS,
  objectMetadataId,
}: {
  gqlFields?: string;
  objectMetadataId?: string;
}) => ({
  query: gql`
    query GetViews($objectMetadataId: String) {
      getViews(objectMetadataId: $objectMetadataId) {
        ${gqlFields}
      }
    }
  `,
  variables: objectMetadataId ? { objectMetadataId } : {},
});
