import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindCoreWorkflowVersionByWorkspaceWorkflowVersionIdFactoryInput = {
  workspaceWorkflowVersionId: string;
};

export const findCoreWorkflowVersionByWorkspaceWorkflowVersionIdQueryFactory =
  ({
    input,
  }: PerformMetadataQueryParams<FindCoreWorkflowVersionByWorkspaceWorkflowVersionIdFactoryInput>) => ({
    query: gql`
      query CoreWorkflowVersion($workspaceWorkflowVersionId: UUID!) {
        coreWorkflowVersion(
          workspaceWorkflowVersionId: $workspaceWorkflowVersionId
        ) {
          id
          steps
        }
      }
    `,
    variables: { workspaceWorkflowVersionId: input.workspaceWorkflowVersionId },
  });
