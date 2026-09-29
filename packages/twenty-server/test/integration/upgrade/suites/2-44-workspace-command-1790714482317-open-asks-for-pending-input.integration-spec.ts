import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type OpenAsksForPendingInputCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790714482317-open-asks-for-pending-input.command';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const QUESTIONS = [
  {
    header: 'Quote',
    question: 'Send the quote to the customer?',
    options: [{ label: 'Send it' }, { label: 'Hold it' }],
  },
];

describe('2-44 workspace command 1790714482317 - OpenAsksForPendingInputCommand (integration)', () => {
  let command: OpenAsksForPendingInputCommand;
  let workspaceOrmManager: WorkspaceOrmManager;

  const threadIds: string[] = [];

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

  const findThreadAsks = (threadId: string) =>
    inWorkspace(() =>
      repository('inputAsk').find({
        where: { threadId },
        select: {
          name: true,
          status: true,
          toolCallId: true,
          form: true,
          assigneeId: true,
          workflowRunId: true,
        },
      }),
    );

  // What a conversation paused on a question looked like before its Ask:
  // the pending marker pointing at the assistant message that asked.
  const insertPausedConversation = async ({
    status,
  }: {
    status: 'pending' | 'answered';
  }) => {
    const threadId = randomUUID();
    const turnId = randomUUID();
    const questionMessageId = randomUUID();
    const toolCallId = `call-${threadId}`;

    threadIds.push(threadId);

    await inWorkspace(async () => {
      await repository('agentChatThread').insert({
        id: threadId,
        title: 'Quote',
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      });
      await repository('agentTurn').insert({ id: turnId, threadId });
      await repository('agentMessage').insert({
        threadId,
        turnId,
        role: AgentMessageRole.USER,
        senderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        processedAt: new Date().toISOString(),
      });
      await repository('agentMessage').insert({
        id: questionMessageId,
        threadId,
        turnId,
        role: AgentMessageRole.ASSISTANT,
        processedAt: new Date().toISOString(),
      });
      await repository('agentMessagePart').insert({
        messageId: questionMessageId,
        orderIndex: 0,
        type: 'tool-ask_questions',
        toolName: 'ask_questions',
        toolCallId,
        toolInput: { questions: QUESTIONS },
        toolOutput: {
          success: true,
          message: 'Questions presented to the user; awaiting their answer.',
          result: { questions: QUESTIONS, status },
        },
        state: 'output-available',
      });
      await repository('agentChatThread').update(
        { id: threadId },
        { pendingQuestionMessageId: questionMessageId },
      );
    });

    return { threadId, toolCallId };
  };

  beforeAll(() => {
    command = getAppProviderByClassName<OpenAsksForPendingInputCommand>(
      'OpenAsksForPendingInputCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
  });

  afterAll(async () => {
    await inWorkspace(async () => {
      for (const threadId of threadIds) {
        await repository('inputAsk').delete({ threadId });
        await repository('agentChatThread').delete({ id: threadId });
      }
    });
  });

  it('is registered in the 2.44 bundle', () => {
    const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
      'UpgradeCommandRegistryService',
    );

    expect(registry.getBundleForVersion('2.44.0').workspaceCommands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ command, timestamp: 1790714482317 }),
      ]),
    );
  });

  it('opens nothing on a dry run', async () => {
    const { threadId } = await insertPausedConversation({ status: 'pending' });

    await runCommand({ dryRun: true });

    expect(await findThreadAsks(threadId)).toEqual([]);
  });

  it('opens a pending Ask for a question still waiting, assigned to who sent the turn', async () => {
    const { threadId, toolCallId } = await insertPausedConversation({
      status: 'pending',
    });

    await runCommand();

    expect(await findThreadAsks(threadId)).toEqual([
      {
        name: 'Send the quote to the customer?',
        status: 'PENDING',
        toolCallId,
        form: { kind: 'questions', questions: QUESTIONS },
        assigneeId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        workflowRunId: null,
      },
    ]);
  });

  it('opens nothing for a question the marker points at but that was answered', async () => {
    const { threadId } = await insertPausedConversation({
      status: 'answered',
    });

    await runCommand();

    expect(await findThreadAsks(threadId)).toEqual([]);
  });

  it('reopens the Ask of a form still waiting, assigned to who started the run', async () => {
    const formAskWhere = {
      name: 'Approve discount',
      status: 'PENDING',
      assigneeId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    };
    const seededFormAsk = await inWorkspace(() =>
      repository('inputAsk').findOneOrFail({
        where: formAskWhere,
        select: { id: true, workflowRunId: true, stepId: true },
      }),
    );

    await inWorkspace(() =>
      repository('inputAsk').delete({ id: seededFormAsk.id }),
    );

    await runCommand();

    expect(
      await inWorkspace(() =>
        repository('inputAsk').find({
          where: {
            workflowRunId: seededFormAsk.workflowRunId,
            stepId: seededFormAsk.stepId,
          },
          select: { status: true, assigneeId: true, form: true },
        }),
      ),
    ).toEqual([
      {
        status: 'PENDING',
        assigneeId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        form: expect.objectContaining({ kind: 'formFields' }),
      },
    ]);
  });

  it('is a no-op when run again', async () => {
    const { threadId } = await insertPausedConversation({ status: 'pending' });

    await runCommand();
    await runCommand();

    expect(await findThreadAsks(threadId)).toHaveLength(1);
  });
});
