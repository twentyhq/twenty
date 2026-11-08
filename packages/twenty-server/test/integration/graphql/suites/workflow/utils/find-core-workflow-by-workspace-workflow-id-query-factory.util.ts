import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindCoreWorkflowByWorkspaceWorkflowIdFactoryInput = {
  workspaceWorkflowId: string;
};

export const findCoreWorkflowByWorkspaceWorkflowIdQueryFactory = ({
  input,
}: PerformMetadataQueryParams<FindCoreWorkflowByWorkspaceWorkflowIdFactoryInput>) => ({
  query: gql`
    query CoreWorkflow($workspaceWorkflowId: UUID!) {
      coreWorkflow(workspaceWorkflowId: $workspaceWorkflowId) {
        id
      }
    }
  `,
  variables: { workspaceWorkflowId: input.workspaceWorkflowId },
});
