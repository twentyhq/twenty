import gql from 'graphql-tag';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const setSendChatMessageEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED,
    value,
    expectToFail: false,
  });

describe('Send chat message workflow step', () => {
  afterAll(async () => {
    await setSendChatMessageEnabled(true);
  });

  it('posts the message in a conversation of the recipient', async () => {
    await setSendChatMessageEnabled(true);

    const title = `Your new deal is ready ${uuidv4()}`;
    const { status, stepStatus, stepResult, stepError } =
      await runWorkflowActionStep({
        name: 'Welcome new deal owners',
        stepType: 'SEND_CHAT_MESSAGE',
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          title,
          message: 'You now own the **Acme renewal**.',
        },
      });
    const threadId = stepResult?.threadId as string | undefined;

    try {
      expect({ status, stepStatus, stepError }).toEqual({
        status: 'COMPLETED',
        stepStatus: 'SUCCESS',
        stepError: undefined,
      });

      const [thread] = await global.testDataSource.query(
        `SELECT title, "workspaceMemberId" FROM "${SCHEMA}"."agentChatThread" WHERE id = $1`,
        [threadId],
      );
      const messages = await global.testDataSource.query(
        `SELECT m.role, m."isHidden", p."textContent"
         FROM "${SCHEMA}"."agentMessage" m
         JOIN "${SCHEMA}"."agentMessagePart" p ON p."messageId" = m.id
         WHERE m."threadId" = $1
         ORDER BY m."processedAt" ASC`,
        [threadId],
      );

      expect(thread).toEqual({
        title,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      });
      expect(messages).toEqual([
        {
          role: 'user',
          isHidden: true,
          textContent:
            'The "Welcome new deal owners" workflow started this conversation. Its messages follow.',
        },
        {
          role: 'assistant',
          isHidden: false,
          textContent: 'You now own the **Acme renewal**.',
        },
      ]);
    } finally {
      if (threadId !== undefined) {
        await destroyAgentChatThread({ threadId });
      }
    }
  }, 120000);

  it('cannot be added to a workflow while the feature flag is off', async () => {
    await setSendChatMessageEnabled(false);

    const workflowResponse = await makeGraphqlApiRequest({
      query: gql`
        mutation CreateWorkflow($name: String!) {
          createWorkflow(data: { name: $name }) {
            id
          }
        }
      `,
      variables: { name: 'Send chat message disabled' },
    });
    const workflow = workflowResponse.body.data.createWorkflow;

    try {
      const versionResponse = await makeGraphqlApiRequest({
        query: gql`
          query FindDraftWorkflowVersion($workflowId: UUID!) {
            workflowVersions(filter: { workflowId: { eq: $workflowId } }) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
        variables: { workflowId: workflow.id },
      });

      const stepResponse = await makeGraphqlApiRequest({
        query: gql`
          mutation CreateWorkflowVersionStep(
            $input: CreateWorkflowVersionStepInput!
          ) {
            createWorkflowVersionStep(input: $input) {
              stepsDiff
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId:
              versionResponse.body.data.workflowVersions.edges[0].node.id,
            stepType: 'SEND_CHAT_MESSAGE',
            parentStepId: 'trigger',
            position: { x: 200, y: 0 },
          },
        },
      });

      expect(JSON.stringify(stepResponse.body.errors)).toContain(
        'is not enabled',
      );
    } finally {
      await makeGraphqlApiRequest({
        query: gql`
          mutation DestroyWorkflow($id: ID!) {
            destroyWorkflow(id: $id) {
              id
            }
          }
        `,
        variables: { id: workflow.id },
      });
    }
  }, 120000);
});
