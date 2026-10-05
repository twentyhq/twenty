import { randomUUID } from 'node:crypto';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, WorkflowActionType } from 'twenty-shared/workflow';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type RecordPendingFormConversationsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790772993322-record-pending-form-conversations.command';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-44 workspace command 1790772993322 - RecordPendingFormConversationsCommand (integration)', () => {
  let command: RecordPendingFormConversationsCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workflowRun: Pick<WorkflowRunWorkspaceEntity, 'id' | 'state'>;
  let formStepId: string;
  let originalState: WorkflowRunWorkspaceEntity['state'];
  let seededThreadId: string;

  const inWorkspace = <TResult>(work: () => Promise<TResult>) =>
    workspaceOrmManager.executeInWorkspaceContext(
      work,
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const repository = (objectName: string) =>
    workspaceOrmManager.getRepository(objectName, {
      shouldBypassPermissionChecks: true,
    });

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    inWorkspace(() =>
      command.runOnWorkspace({ ...RUN_ON_WORKSPACE_ARGS, options }),
    );

  const findFormThreadId = async () => {
    const { state } = await inWorkspace(() =>
      repository('workflowRun').findOneOrFail({
        where: { id: workflowRun.id },
        select: { state: true },
      }),
    );

    return state?.stepInfos?.[formStepId]?.threadId;
  };

  // A form step pending since before this release, with no recorded conversation.
  const forgetFormConversation = () =>
    inWorkspace(() =>
      repository('workflowRun').update(workflowRun.id, {
        state: {
          ...workflowRun.state,
          stepInfos: {
            ...workflowRun.state?.stepInfos,
            [formStepId]: { status: StepStatus.PENDING },
          },
        },
      }),
    );

  beforeAll(async () => {
    command = getAppProviderByClassName<RecordPendingFormConversationsCommand>(
      'RecordPendingFormConversationsCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    const [runningWorkflowRun] = (await inWorkspace(() =>
      repository('workflowRun').find({
        where: { status: WorkflowRunStatus.RUNNING },
        select: { id: true, state: true },
        take: 1,
      }),
    )) as Pick<WorkflowRunWorkspaceEntity, 'id' | 'state'>[];

    if (!isDefined(runningWorkflowRun?.state)) {
      throw new Error('The seed has no running workflow run to add a form to');
    }

    originalState = runningWorkflowRun.state;
    formStepId = randomUUID();
    seededThreadId = randomUUID();

    // a form step waiting since before 2.44, with the conversation 2.44 recorded for it
    workflowRun = {
      id: runningWorkflowRun.id,
      state: {
        ...originalState,
        flow: {
          ...originalState.flow,
          steps: [
            ...originalState.flow.steps,
            {
              id: formStepId,
              name: 'Approve the discount',
              type: WorkflowActionType.FORM,
              valid: true,
              settings: {
                input: [
                  {
                    id: randomUUID(),
                    name: 'discount',
                    label: 'Discount',
                    type: FieldMetadataType.NUMBER,
                  },
                ],
                outputSchema: {},
                errorHandlingOptions: {
                  retryOnFailure: { value: 0 },
                  continueOnFailure: { value: false },
                },
              },
              nextStepIds: [],
            },
          ],
        },
        stepInfos: {
          ...originalState.stepInfos,
          [formStepId]: {
            status: StepStatus.PENDING,
            threadId: seededThreadId,
          },
        },
      },
    };

    await inWorkspace(async () => {
      await repository('workflowRun').update(workflowRun.id, {
        state: workflowRun.state,
      });
      await repository('agentChatThread').insert({
        id: seededThreadId,
        title: 'Approve the discount',
        workflowRunId: workflowRun.id,
      });
    });
  });

  afterAll(async () => {
    if (!isDefined(workflowRun) || !isDefined(originalState)) {
      return;
    }

    await inWorkspace(async () => {
      await repository('agentChatThread').delete({ id: seededThreadId });
      await repository('workflowRun').update(workflowRun.id, {
        state: originalState,
      });
    });
  });

  afterEach(async () => {
    const threadId = await findFormThreadId();

    await inWorkspace(async () => {
      if (threadId !== undefined && threadId !== seededThreadId) {
        await repository('agentChatThread').delete({ id: threadId });
      }

      await repository('workflowRun').update(workflowRun.id, {
        state: workflowRun.state,
      });
    });
  });

  it('is registered in the 2.44 bundle', () => {
    const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
      'UpgradeCommandRegistryService',
    );

    expect(registry.getBundleForVersion('2.44.0').workspaceCommands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ command, timestamp: 1790772993322 }),
      ]),
    );
  });

  it('records nothing on a dry run', async () => {
    await forgetFormConversation();

    await runCommand({ dryRun: true });

    expect(await findFormThreadId()).toBeUndefined();
  });

  it('records a pending request_form call named after the step, that the conversation waits on', async () => {
    await forgetFormConversation();

    await runCommand();

    const threadId = await findFormThreadId();

    const thread = await inWorkspace(() =>
      repository('agentChatThread').findOneOrFail({
        where: { id: threadId },
        select: { workflowRunId: true, pendingQuestionMessageId: true },
      }),
    );

    expect(thread.workflowRunId).toBe(workflowRun.id);

    const parts = await inWorkspace(() =>
      repository('agentMessagePart').find({
        where: { messageId: thread.pendingQuestionMessageId },
        select: { toolName: true, toolCallId: true, toolOutput: true },
      }),
    );

    expect(parts).toEqual([
      {
        toolName: 'request_form',
        toolCallId: formStepId,
        toolOutput: expect.objectContaining({
          result: { status: 'pending' },
        }),
      },
    ]);
  });

  it('leaves a form whose conversation is recorded alone', async () => {
    await runCommand();

    expect(await findFormThreadId()).toBe(seededThreadId);
  });
});
