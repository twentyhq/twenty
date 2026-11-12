import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type RunCoreWorkflowVersionFactoryInput = {
  coreWorkflowVersionId: string;
  payload?: object;
};

export const runCoreWorkflowVersionQueryFactory = ({
  input,
}: PerformMetadataQueryParams<RunCoreWorkflowVersionFactoryInput>) => ({
  query: gql`
    mutation RunCoreWorkflowVersion($input: RunCoreWorkflowVersionInput!) {
      runCoreWorkflowVersion(input: $input) {
        workflowRunId
      }
    }
  `,
  variables: { input },
});
