import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

export const answerToolCall = async ({
  toolCall,
  response,
}: {
  toolCall: { threadId: string; toolCallId: string };
  response: Record<string, unknown>;
}) =>
  workflowGraphqlRequest(
    'mutation Answer($input: AnswerToolCallInput!) { answerToolCall(input: $input) { streamId } }',
    { input: { ...toolCall, response } },
  );
