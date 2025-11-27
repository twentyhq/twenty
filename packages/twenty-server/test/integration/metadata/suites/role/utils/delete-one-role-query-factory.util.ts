import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteOneRoleFactoryInput = {
  idToDelete: string;
};

export const deleteOneRoleQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DeleteOneRoleFactoryInput>) => ({
  query: gql`
    mutation DeleteOneRole($idToDelete: UUID!) {
      deleteOneRole(roleId: $idToDelete)
    }
  `,
  variables: {
    idToDelete: input.idToDelete,
  },
});
