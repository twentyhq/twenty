import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeletePermissionFlagFactoryInput = {
  id: string;
};

const DEFAULT_PERMISSION_FLAG_GQL_FIELDS = `
  id
  key
  label
`;

export const deletePermissionFlagQueryFactory = ({
  input,
  gqlFields = DEFAULT_PERMISSION_FLAG_GQL_FIELDS,
}: PerformMetadataQueryParams<DeletePermissionFlagFactoryInput>) => ({
  query: gql`
    mutation DeletePermissionFlag($id: UUID!) {
      deletePermissionFlag(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
