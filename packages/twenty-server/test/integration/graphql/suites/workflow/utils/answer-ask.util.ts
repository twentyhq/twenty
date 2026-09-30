import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type AskLocation =
  | { workflowRunId: string; stepId: string }
  | { threadId: string; toolCallId: string };

const findAskId = async (ask: AskLocation): Promise<string | undefined> => {
  const [condition, parameters] =
    'threadId' in ask
      ? [
          '"threadId" = $1 AND "toolCallId" = $2',
          [ask.threadId, ask.toolCallId],
        ]
      : [
          '"workflowRunId" = $1 AND "stepId" = $2 AND "toolCallId" IS NULL',
          [ask.workflowRunId, ask.stepId],
        ];

  const [row] = await global.testDataSource.query(
    `SELECT id FROM "${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."inputAsk" WHERE ${condition}`,
    parameters,
  );

  return row?.id;
};

export const answerAsk = async ({
  ask,
  response,
}: {
  ask: AskLocation;
  response: Record<string, unknown>;
}) =>
  workflowGraphqlRequest(
    'mutation Answer($input: AnswerAskInput!) { answerAsk(input: $input) { streamId } }',
    { input: { askId: await findAskId(ask), response } },
  );
