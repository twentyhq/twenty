import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteUserFromWorkspaceFactoryInput = {
  workspaceMemberIdToDelete: string;
};

export const deleteUserFromWorkspaceQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DeleteUserFromWorkspaceFactoryInput>) => ({
  query: gql`
    mutation DeleteUserFromWorkspace($workspaceMemberIdToDelete: String!) {
      deleteUserFromWorkspace(
        workspaceMemberIdToDelete: $workspaceMemberIdToDelete
      ) {
        id
      }
    }
  `,
  variables: { workspaceMemberIdToDelete: input.workspaceMemberIdToDelete },
});
