import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type ToolCallLocation =
  | { workflowRunId: string; stepId: string }
  | { threadId: string; toolCallId: string };

const findFormStepThreadId = async ({
  workflowRunId,
  stepId,
}: {
  workflowRunId: string;
  stepId: string;
}): Promise<string | undefined> => {
  const [row] = await global.testDataSource.query(
    `SELECT state->'stepInfos'->$2->>'threadId' AS "threadId" FROM "${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."workflowRun" WHERE id = $1`,
    [workflowRunId, stepId],
  );

  return row?.threadId;
};

export const answerToolCall = async ({
  toolCall,
  response,
}: {
  toolCall: ToolCallLocation;
  response: Record<string, unknown>;
}) =>
  workflowGraphqlRequest(
    'mutation Answer($input: AnswerToolCallInput!) { answerToolCall(input: $input) { streamId } }',
    {
      input: {
        ...('threadId' in toolCall
          ? toolCall
          : {
              threadId: await findFormStepThreadId(toolCall),
              toolCallId: toolCall.stepId,
            }),
        response,
      },
    },
  );
