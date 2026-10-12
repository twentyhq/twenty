import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

export const submitFormStep = ({
  workflowRunId,
  stepId,
  response,
}: {
  workflowRunId: string;
  stepId: string;
  response: Record<string, unknown>;
}) =>
  workflowGraphqlRequest(
    'mutation SubmitFormStep($input: SubmitFormStepInput!) { submitFormStep(input: $input) }',
    { input: { workflowRunId, stepId, response } },
  );
