import gql from 'graphql-tag';
import { answerToolCall } from 'test/integration/graphql/suites/workflow/utils/answer-tool-call.util';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { waitForWorkflowRunStepStatus } from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
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
          text: 'You now own the **Acme renewal**.',
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

  describe('with an action to approve', () => {
    let companyId: string;

    const readEmployees = async (): Promise<number | null> => {
      const [company] = await global.testDataSource.query(
        `SELECT employees FROM "${SCHEMA}"."company" WHERE id = $1`,
        [companyId],
      );

      return company?.employees ?? null;
    };

    // set as soon as the step posts, so a failing test still removes its conversation
    let postedThreadId: string | undefined;

    // the step waits on the recipient, who answers the call it posted to their inbox
    const answerPostedCall = async ({
      workflowRunId,
      stepId,
      response,
    }: {
      workflowRunId: string;
      stepId: string;
      response: Record<string, unknown>;
    }) => {
      await waitForWorkflowRunStepStatus(workflowRunId, stepId, 'PENDING');

      const [{ threadId }] = await global.testDataSource.query(
        `SELECT state->'stepInfos'->$2->>'threadId' AS "threadId" FROM "${SCHEMA}"."workflowRun" WHERE id = $1`,
        [workflowRunId, stepId],
      );

      postedThreadId = threadId;

      const [part] = await global.testDataSource.query(
        `SELECT p."toolCallId", p."toolOutput"
         FROM "${SCHEMA}"."agentMessagePart" p
         JOIN "${SCHEMA}"."agentMessage" m ON m.id = p."messageId"
         WHERE m."threadId" = $1 AND p."toolName" = 'propose_tool_call'
           AND p."toolOutput"->'result'->>'status' = 'pending'`,
        [threadId],
      );

      expect(part.toolOutput.result).toMatchObject({
        status: 'pending',
        proposal: {
          template: 'recordUpdate',
          recordId: companyId,
          currentValues: { employees: 10 },
        },
      });

      const answer = await answerToolCall({
        toolCall: { threadId, toolCallId: part.toolCallId },
        response,
      });

      expect(answer.body.errors).toBeUndefined();
    };

    beforeEach(async () => {
      await setSendChatMessageEnabled(true);

      const response = await makeGraphqlApiRequest({
        query: gql`
          mutation CreateCompany($data: CompanyCreateInput!) {
            createCompany(data: $data) {
              id
            }
          }
        `,
        variables: {
          data: { name: `Approval ${uuidv4()}`, employees: 10 },
        },
      });

      companyId = response.body.data.createCompany.id;
    });

    afterEach(async () => {
      if (postedThreadId !== undefined) {
        await destroyAgentChatThread({ threadId: postedThreadId });
        postedThreadId = undefined;
      }

      await makeGraphqlApiRequest({
        query: gql`
          mutation DestroyCompany($id: UUID!) {
            destroyCompany(id: $id) {
              id
            }
          }
        `,
        variables: { id: companyId },
      });
    });

    it('runs the action as the recipient approved it, then goes on', async () => {
      const { status, stepStatus, stepResult } = await runWorkflowActionStep({
        name: 'Approve a headcount change',
        stepType: 'SEND_CHAT_MESSAGE',
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          title: 'Headcount check',
          text: 'Raise the headcount to 25?',
          toolCall: {
            toolName: 'update_one_company',
            arguments: { id: companyId, employees: 25 },
          },
        },
        whileRunning: ({ workflowRunId, stepId }) =>
          answerPostedCall({
            workflowRunId,
            stepId,
            response: {
              decision: 'approve',
              arguments: { id: companyId, employees: 30 },
            },
          }),
      });

      expect({ status, stepStatus }).toEqual({
        status: 'COMPLETED',
        stepStatus: 'SUCCESS',
      });
      expect(stepResult).toMatchObject({
        threadId: postedThreadId,
        isApproved: true,
        isExecuted: true,
        approvedToolName: 'update_one_company',
        status: 'approved',
        arguments: { id: companyId, employees: 30 },
      });
      expect(await readEmployees()).toBe(30);
    }, 120000);

    it('runs nothing when the recipient rejects the action', async () => {
      const { status, stepResult } = await runWorkflowActionStep({
        name: 'Reject a headcount change',
        stepType: 'SEND_CHAT_MESSAGE',
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          title: 'Headcount check',
          text: 'Raise the headcount to 25?',
          toolCall: {
            toolName: 'update_one_company',
            arguments: { id: companyId, employees: 25 },
          },
        },
        whileRunning: ({ workflowRunId, stepId }) =>
          answerPostedCall({
            workflowRunId,
            stepId,
            response: { decision: 'reject', feedback: 'Wait for the audit' },
          }),
      });

      expect(status).toBe('COMPLETED');
      expect(stepResult).toMatchObject({
        isApproved: false,
        isExecuted: false,
        approvedToolName: null,
        status: 'rejected',
        feedback: 'Wait for the audit',
      });
      expect(await readEmployees()).toBe(10);
    }, 120000);

    it('reports an approved action whose record changed as not executed', async () => {
      const { status, stepResult } = await runWorkflowActionStep({
        name: 'Approve a stale headcount change',
        stepType: 'SEND_CHAT_MESSAGE',
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          title: 'Headcount check',
          text: 'Raise the headcount to 25?',
          toolCall: {
            toolName: 'update_one_company',
            arguments: { id: companyId, employees: 25 },
          },
        },
        whileRunning: async ({ workflowRunId, stepId }) => {
          await waitForWorkflowRunStepStatus(workflowRunId, stepId, 'PENDING');
          await global.testDataSource.query(
            `UPDATE "${SCHEMA}"."company" SET employees = 12 WHERE id = $1`,
            [companyId],
          );
          await answerPostedCall({
            workflowRunId,
            stepId,
            response: { decision: 'approve' },
          });
        },
      });

      expect(status).toBe('COMPLETED');
      expect(stepResult).toMatchObject({
        isApproved: true,
        isExecuted: false,
        status: 'conflict',
      });
      expect(await readEmployees()).toBe(12);
    }, 120000);

    it('never runs an approved action twice when recording the answer fails', async () => {
      const agentChatService =
        getAppProviderByClassName<AgentChatService>('AgentChatService');
      const recordToolCallAnswer = jest
        .spyOn(agentChatService, 'recordToolCallAnswer')
        .mockRejectedValueOnce(new Error('Database unavailable'));
      let secondAnswerErrors: string | undefined;
      let partResult: Record<string, unknown> | undefined;

      try {
        const { status } = await runWorkflowActionStep({
          name: 'Approve a headcount change once',
          stepType: 'SEND_CHAT_MESSAGE',
          input: {
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
            title: 'Headcount check',
            text: 'Raise the headcount to 25?',
            toolCall: {
              toolName: 'update_one_company',
              arguments: { id: companyId, employees: 25 },
            },
          },
          whileRunning: async ({ workflowRunId, stepId }) => {
            await waitForWorkflowRunStepStatus(
              workflowRunId,
              stepId,
              'PENDING',
            );

            const [{ threadId }] = await global.testDataSource.query(
              `SELECT state->'stepInfos'->$2->>'threadId' AS "threadId" FROM "${SCHEMA}"."workflowRun" WHERE id = $1`,
              [workflowRunId, stepId],
            );

            postedThreadId = threadId;

            const readCall = async () => {
              const [part] = await global.testDataSource.query(
                `SELECT p."toolCallId", p."toolOutput" FROM "${SCHEMA}"."agentMessagePart" p
                 JOIN "${SCHEMA}"."agentMessage" m ON m.id = p."messageId"
                 WHERE m."threadId" = $1 AND p."toolName" = 'propose_tool_call'`,
                [threadId],
              );

              return part;
            };
            const { toolCallId } = await readCall();
            const approve = () =>
              answerToolCall({
                toolCall: { threadId, toolCallId },
                response: { decision: 'approve' },
              });

            expect((await approve()).body.errors).toBeDefined();

            secondAnswerErrors = JSON.stringify((await approve()).body.errors);
            partResult = (await readCall()).toolOutput.result;
          },
        });

        expect(status).toBe('FAILED');
      } finally {
        recordToolCallAnswer.mockRestore();
      }

      expect(secondAnswerErrors).toContain('TOOL_CALL_NOT_PENDING');
      expect(partResult).toMatchObject({
        status: 'failed',
        error:
          'Interrupted before its outcome was recorded. It may or may not have run.',
      });
      expect(await readEmployees()).toBe(25);
    }, 120000);

    it('asks again when a failed run is retried before the action was answered', async () => {
      const { status, stepResult } = await runWorkflowActionStep({
        name: 'Retry a headcount check',
        stepType: 'SEND_CHAT_MESSAGE',
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          title: 'Headcount check',
          text: 'Raise the headcount to 25?',
          toolCall: {
            toolName: 'update_one_company',
            arguments: { id: companyId, employees: 25 },
          },
        },
        whileRunning: async ({ workflowRunId, stepId }) => {
          await waitForWorkflowRunStepStatus(workflowRunId, stepId, 'PENDING');

          const [{ threadId }] = await global.testDataSource.query(
            `SELECT state->'stepInfos'->$2->>'threadId' AS "threadId" FROM "${SCHEMA}"."workflowRun" WHERE id = $1`,
            [workflowRunId, stepId],
          );

          postedThreadId = threadId;

          await getAppProviderByClassName<WorkflowRunWorkspaceService>(
            'WorkflowRunWorkspaceService',
          ).endWorkflowRun({
            workflowRunId,
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            status: WorkflowRunStatus.FAILED,
            error: 'Another branch failed',
          });

          const retry = await workflowGraphqlRequest(
            'mutation Retry($id: UUID!) { retryWorkflowRun(workflowRunId: $id) { id } }',
            { id: workflowRunId },
          );

          expect(retry.body.errors).toBeUndefined();

          await answerPostedCall({
            workflowRunId,
            stepId,
            response: { decision: 'approve' },
          });
        },
      });

      const proposalStatuses = await global.testDataSource.query(
        `SELECT p."toolOutput"->'result'->>'status' AS status FROM "${SCHEMA}"."agentMessagePart" p
         JOIN "${SCHEMA}"."agentMessage" m ON m.id = p."messageId"
         WHERE m."threadId" = $1 AND p."toolName" = 'propose_tool_call'
         ORDER BY m."createdAt"`,
        [postedThreadId],
      );

      expect(status).toBe('COMPLETED');
      expect(stepResult).toMatchObject({ isExecuted: true });
      expect(
        proposalStatuses.map(({ status }: { status: string }) => status),
      ).toEqual(['skipped', 'approved']);
      expect(await readEmployees()).toBe(25);
    }, 120000);

    it('closes the call in the inbox when the run is stopped before the answer', async () => {
      const { status } = await runWorkflowActionStep({
        name: 'Stop a headcount check',
        stepType: 'SEND_CHAT_MESSAGE',
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          title: 'Headcount check',
          text: 'Raise the headcount to 25?',
          toolCall: {
            toolName: 'update_one_company',
            arguments: { id: companyId, employees: 25 },
          },
        },
        whileRunning: async ({ workflowRunId, stepId }) => {
          await waitForWorkflowRunStepStatus(workflowRunId, stepId, 'PENDING');

          const [{ threadId }] = await global.testDataSource.query(
            `SELECT state->'stepInfos'->$2->>'threadId' AS "threadId" FROM "${SCHEMA}"."workflowRun" WHERE id = $1`,
            [workflowRunId, stepId],
          );

          postedThreadId = threadId;

          const stop = await workflowGraphqlRequest(
            'mutation Stop($id: UUID!) { stopWorkflowRun(workflowRunId: $id) { id status } }',
            { id: workflowRunId },
          );

          expect(stop.body.errors).toBeUndefined();
        },
      });

      const [thread] = await global.testDataSource.query(
        `SELECT "pendingQuestionMessageId" FROM "${SCHEMA}"."agentChatThread" WHERE id = $1`,
        [postedThreadId],
      );
      const [part] = await global.testDataSource.query(
        `SELECT p."toolOutput" FROM "${SCHEMA}"."agentMessagePart" p
         JOIN "${SCHEMA}"."agentMessage" m ON m.id = p."messageId"
         WHERE m."threadId" = $1 AND p."toolName" = 'propose_tool_call'`,
        [postedThreadId],
      );

      expect(status).toBe('STOPPED');
      expect(thread.pendingQuestionMessageId).toBeNull();
      expect(part.toolOutput.result.status).toBe('skipped');
      expect(await readEmployees()).toBe(10);
    }, 120000);

    it('fails the step when its action cannot be proposed', async () => {
      const { stepStatus, stepError } = await runWorkflowActionStep({
        name: 'Propose an unknown action',
        stepType: 'SEND_CHAT_MESSAGE',
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          title: 'Unknown action',
          text: 'Approve this?',
          toolCall: { toolName: 'drop_everything', arguments: {} },
        },
      });

      expect(stepStatus).toBe('FAILED');
      expect(stepError).toContain('cannot be proposed');
      expect(await readEmployees()).toBe(10);
    }, 120000);
  });

  it('fails a step that runs after the feature flag is turned off', async () => {
    await setSendChatMessageEnabled(true);

    const { stepStatus, stepError } = await runWorkflowActionStep({
      name: 'Send chat message turned off',
      stepType: 'SEND_CHAT_MESSAGE',
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        title: 'Should not be sent',
        text: 'Hello',
      },
      beforeRun: () => setSendChatMessageEnabled(false),
    });

    expect(stepStatus).toBe('FAILED');
    expect(stepError).toContain('is not enabled');
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
