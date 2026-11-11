import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type TestWorkflowCodeStepFactoryInput = {
  workflowVersionId: string;
  code: string;
  payload: Record<string, unknown>;
};

export const testWorkflowCodeStepQueryFactory = ({
  input,
}: PerformMetadataQueryParams<TestWorkflowCodeStepFactoryInput>) => ({
  query: gql`
    mutation TestWorkflowCodeStep($input: TestWorkflowCodeStepInput!) {
      testWorkflowCodeStep(input: $input) {
        data
        logs
        duration
        status
        error
      }
    }
  `,
  variables: { input },
});
