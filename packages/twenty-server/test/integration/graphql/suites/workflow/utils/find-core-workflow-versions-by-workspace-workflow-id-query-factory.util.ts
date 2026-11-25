import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindCoreWorkflowVersionsByWorkspaceWorkflowIdFactoryInput = {
  workspaceWorkflowId: string;
};

export const findCoreWorkflowVersionsByWorkspaceWorkflowIdQueryFactory = ({
  input,
}: PerformMetadataQueryParams<FindCoreWorkflowVersionsByWorkspaceWorkflowIdFactoryInput>) => ({
  query: gql`
    query CoreWorkflowVersions($workspaceWorkflowId: UUID!) {
      coreWorkflowVersions(workspaceWorkflowId: $workspaceWorkflowId) {
        id
      }
    }
  `,
  variables: { workspaceWorkflowId: input.workspaceWorkflowId },
});
