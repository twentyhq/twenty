import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindPageLayoutsFactoryInput = {
  objectMetadataId?: string;
} | void;

const DEFAULT_PAGE_LAYOUT_GQL_FIELDS = `
  id
  name
  type
  objectMetadataId
  createdAt
  updatedAt
  deletedAt
`;

export const findPageLayoutsQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_GQL_FIELDS,
}: PerformMetadataQueryParams<FindPageLayoutsFactoryInput>) => ({
  query: gql`
    query GetPageLayouts($objectMetadataId: String) {
      getPageLayouts(objectMetadataId: $objectMetadataId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    objectMetadataId: input?.objectMetadataId,
  },
});
