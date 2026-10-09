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

// 2.46 dropped the run link this command recorded conversations on, so a
// workspace upgrading past 2.44 keeps answering its forms from their runs.
describe('2-44 workspace command 1790772993322 - RecordPendingFormConversationsCommand (integration)', () => {
  let command: RecordPendingFormConversationsCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workflowRunId: string;
  let formStepId: string;
  let originalState: WorkflowRunWorkspaceEntity['state'];

  const inWorkspace = <TResult>(work: () => Promise<TResult>) =>
    workspaceOrmManager.executeInWorkspaceContext(
      work,
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const workflowRunRepository = () =>
    workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
      'workflowRun',
      { shouldBypassPermissionChecks: true },
    );

  beforeAll(async () => {
    command = getAppProviderByClassName<RecordPendingFormConversationsCommand>(
      'RecordPendingFormConversationsCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    const [runningWorkflowRun] = await inWorkspace(() =>
      workflowRunRepository().find({
        where: { status: WorkflowRunStatus.RUNNING },
        select: { id: true, state: true },
        take: 1,
      }),
    );

    if (!isDefined(runningWorkflowRun?.state)) {
      throw new Error('The seed has no running workflow run to add a form to');
    }

    workflowRunId = runningWorkflowRun.id;
    originalState = runningWorkflowRun.state;
    formStepId = randomUUID();

    // a form step waiting since before 2.44, with no recorded conversation
    await inWorkspace(() =>
      workflowRunRepository().update(workflowRunId, {
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
            [formStepId]: { status: StepStatus.PENDING },
          },
        },
      }),
    );
  });

  afterAll(async () => {
    if (!isDefined(workflowRunId) || !isDefined(originalState)) {
      return;
    }

    await inWorkspace(() =>
      workflowRunRepository().update(workflowRunId, { state: originalState }),
    );
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

  it('records no conversation once threads no longer name a run', async () => {
    const countThreads = () =>
      inWorkspace(() =>
        workspaceOrmManager
          .getRepository('agentChatThread', {
            shouldBypassPermissionChecks: true,
          })
          .count({ withDeleted: true }),
      );
    const threadCountBefore = await countThreads();

    await inWorkspace(() =>
      command.runOnWorkspace({ ...RUN_ON_WORKSPACE_ARGS, options: {} }),
    );

    expect(await countThreads()).toBe(threadCountBefore);

    const { state } = await inWorkspace(() =>
      workflowRunRepository().findOneOrFail({
        where: { id: workflowRunId },
        select: { state: true },
      }),
    );

    expect(state?.stepInfos?.[formStepId]).toEqual({
      status: StepStatus.PENDING,
    });
  });
});
