import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindFrontComponentFactoryInput = {
  id: string;
};

const DEFAULT_FRONT_COMPONENT_GQL_FIELDS = `
  id
  name
  applicationId
  createdAt
  updatedAt
`;

export const findFrontComponentQueryFactory = ({
  input,
  gqlFields = DEFAULT_FRONT_COMPONENT_GQL_FIELDS,
}: PerformMetadataQueryParams<FindFrontComponentFactoryInput>) => ({
  query: gql`
    query FrontComponent($id: UUID!) {
      frontComponent(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
