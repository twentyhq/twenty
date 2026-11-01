import { type StepResult, type ToolSet } from 'ai';
import { randomUUID } from 'node:crypto';
import { parse } from 'graphql';
import {
  type AgentRunExecution,
  captureAgentRunExecution,
} from 'test/integration/graphql/suites/user-session/utils/capture-agent-run-execution.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

// history keeps a turn's tool calls only for the member who sent it
const TOOL_CALL_STEPS = [
  {
    content: [
      {
        type: 'tool-call',
        toolCallId: 'probe-call',
        toolName: 'probe',
        input: {},
      },
      {
        type: 'tool-result',
        toolCallId: 'probe-call',
        toolName: 'probe',
        input: {},
        output: { isProbed: true },
      },
    ],
  },
] as unknown as StepResult<ToolSet>[];

type GlobalTestContext = {
  agentUniversalIdentifier: string;
  applicationId: string;
  applicationToken: string;
  janeApplicationToken: string;
  jonyApplicationToken: string;
};

type TestContext = {
  token: (globalContext: GlobalTestContext) => string;
  senderWorkspaceMemberId: string | null;
  isSentThroughApplication: boolean;
  creatorWorkspaceMemberId: string | null;
};

const recordedTurnTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'an application token issued for a member runs the agent',
    context: {
      token: (globalContext) => globalContext.janeApplicationToken,
      senderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      isSentThroughApplication: true,
      creatorWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    },
  },
  {
    title: 'a member session runs the agent',
    context: {
      token: () => APPLE_JONY_MEMBER_ACCESS_TOKEN,
      senderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      isSentThroughApplication: false,
      creatorWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    },
  },
  {
    title: 'the application runs its own agent with no user',
    context: {
      token: (globalContext) => globalContext.applicationToken,
      senderWorkspaceMemberId: null,
      isSentThroughApplication: true,
      creatorWorkspaceMemberId: null,
    },
  },
];

const findRecordedTurn = async (threadId: string) => {
  const [[message], [turn]] = await Promise.all([
    globalThis.testDataSource.query(
      `SELECT "senderWorkspaceMemberId", "senderApplicationId"
       FROM "${WORKSPACE_SCHEMA}"."agentMessage"
       WHERE "threadId" = $1 AND role = $2`,
      [threadId, AgentMessageRole.USER],
    ),
    globalThis.testDataSource.query(
      `SELECT "createdByWorkspaceMemberId"
       FROM "${WORKSPACE_SCHEMA}"."agentTurn"
       WHERE "threadId" = $1`,
      [threadId],
    ),
  ]);

  return { ...message, ...turn };
};

const findThread = async (threadId: string) => {
  const [thread] = await globalThis.testDataSource.query(
    `SELECT "workspaceMemberId", "deletedAt"
     FROM "${WORKSPACE_SCHEMA}"."agentChatThread"
     WHERE id = $1`,
    [threadId],
  );

  return thread;
};

const findThreadOwner = async (threadId: string) =>
  (await findThread(threadId)).workspaceMemberId;

const isThreadFollowed = async ({
  threadId,
  workspaceMemberId,
}: {
  threadId: string;
  workspaceMemberId: string;
}) => {
  const [participant] = await globalThis.testDataSource.query(
    `SELECT "isSubscribed" FROM "${WORKSPACE_SCHEMA}"."agentChatThreadParticipant"
     WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
    [threadId, workspaceMemberId],
  );

  return participant?.isSubscribed ?? null;
};

const countThreadOwnerGrants = async ({
  threadId,
  workspaceMemberId,
}: {
  threadId: string;
  workspaceMemberId: string;
}) => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT count(*)::int AS count FROM "${WORKSPACE_SCHEMA}"."recordShare"
     WHERE "recordId" = $1 AND "principalId" = $2 AND "rowCause" = 'OWNER'`,
    [threadId, workspaceMemberId],
  );

  return count;
};

const disownThread = async (threadId: string) => {
  await globalThis.testDataSource.query(
    `DELETE FROM "${WORKSPACE_SCHEMA}"."recordShare" WHERE "recordId" = $1`,
    [threadId],
  );
  await globalThis.testDataSource.query(
    `DELETE FROM "${WORKSPACE_SCHEMA}"."agentChatThreadParticipant" WHERE "threadId" = $1`,
    [threadId],
  );
  await globalThis.testDataSource.query(
    `UPDATE "${WORKSPACE_SCHEMA}"."agentChatThread" SET "workspaceMemberId" = NULL WHERE id = $1`,
    [threadId],
  );
};

const findPriorMessagePartTypes = ({ priorMessages }: AgentRunExecution) =>
  (priorMessages ?? []).flatMap(({ parts }) => parts.map(({ type }) => type));

describe('Agent run conversation should be recorded for the caller', () => {
  let application: ApplicationWithResources;
  let globalTestContext: GlobalTestContext;
  const threadIds: string[] = [];

  const runAgent = async ({
    token,
    threadKey,
    runAsWorkspaceMemberId,
    steps,
  }: {
    token: string;
    threadKey?: string;
    runAsWorkspaceMemberId?: string;
    steps?: StepResult<ToolSet>[];
  }) => {
    const execution = await captureAgentRunExecution({
      agentUniversalIdentifier: globalTestContext.agentUniversalIdentifier,
      token,
      thread: isDefined(threadKey) ? { key: threadKey } : undefined,
      runAsWorkspaceMemberId,
      steps,
    });

    if (!threadIds.includes(execution.threadId)) {
      threadIds.push(execution.threadId);
    }

    return execution;
  };

  beforeAll(async () => {
    application = await setupApplicationWithResources({
      name: 'Agent Run Conversation Probe',
    });

    const [{ universalIdentifier: agentUniversalIdentifier }] =
      await globalThis.testDataSource.query(
        `SELECT "universalIdentifier" FROM core."agent" WHERE id = $1`,
        [application.agentId],
      );

    const [applicationTokenPair, janeTokenPair, jonyTokenPair] =
      await Promise.all([
        generateApplicationTokenPair({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: application.id,
        }),
        generateAppleAdminApplicationTokenPair({
          applicationId: application.id,
        }),
        generateApplicationTokenPair({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: application.id,
          userId: USER_DATA_SEED_IDS.JONY,
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        }),
      ]);

    globalTestContext = {
      agentUniversalIdentifier,
      applicationId: application.id,
      applicationToken: applicationTokenPair.applicationAccessToken.token,
      janeApplicationToken: janeTokenPair.applicationAccessToken.token,
      jonyApplicationToken: jonyTokenPair.applicationAccessToken.token,
    };
  }, 120000);

  afterAll(async () => {
    // the application's own threads have no member who could destroy them through the API
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."recordShare" WHERE "recordId" = ANY($1)`,
      [threadIds],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."agentChatThread" WHERE id = ANY($1)`,
      [threadIds],
    );

    if (!isDefined(application)) {
      return;
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it.each(eachTestingContextFilter(recordedTurnTestCases))(
    'should record who sent the turn when $title',
    async ({ context }) => {
      const { threadId } = await runAgent({
        token: context.token(globalTestContext),
      });

      expect(await findRecordedTurn(threadId)).toEqual({
        senderWorkspaceMemberId: context.senderWorkspaceMemberId,
        senderApplicationId: context.isSentThroughApplication
          ? globalTestContext.applicationId
          : null,
        createdByWorkspaceMemberId: context.creatorWorkspaceMemberId,
      });
    },
  );

  it('should keep the full history for a member continuing their own thread', async () => {
    const threadKey = randomUUID();

    await runAgent({
      token: globalTestContext.janeApplicationToken,
      threadKey,
      steps: TOOL_CALL_STEPS,
    });

    const execution = await runAgent({
      token: globalTestContext.janeApplicationToken,
      threadKey,
    });

    expect(findPriorMessagePartTypes(execution)).toContain('tool-probe');
    expect(await findThreadOwner(execution.threadId)).toBe(
      WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    );
  });

  it('should give the thread to the member the application runs it as', async () => {
    const { threadId } = await runAgent({
      token: globalTestContext.applicationToken,
      threadKey: randomUUID(),
      runAsWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    expect(await findThreadOwner(threadId)).toBe(
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );
    expect(
      await isThreadFollowed({
        threadId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    ).toBe(false);
  });

  it('should give a thread left without an owner to the member who took part in it', async () => {
    const threadKey = randomUUID();
    const runAsJony = () =>
      runAgent({
        token: globalTestContext.applicationToken,
        threadKey,
        runAsWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });
    const { threadId } = await runAsJony();

    await disownThread(threadId);

    await runAsJony();

    expect(await findThreadOwner(threadId)).toBe(
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );
    expect(
      await countThreadOwnerGrants({
        threadId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    ).toBe(1);
    expect(
      await isThreadFollowed({
        threadId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    ).toBe(false);
  });

  it('should not give a member a thread someone else took part in', async () => {
    const threadKey = randomUUID();

    await runAgent({
      token: globalTestContext.applicationToken,
      threadKey,
    });

    const { threadId } = await runAgent({
      token: globalTestContext.applicationToken,
      threadKey,
      runAsWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    expect(await findThreadOwner(threadId)).toBeNull();
    expect(
      await countThreadOwnerGrants({
        threadId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    ).toBe(0);
  });

  it('should bring back a thread its owner deleted when they run it again', async () => {
    const threadKey = randomUUID();
    const runAsJony = () =>
      runAgent({
        token: globalTestContext.applicationToken,
        threadKey,
        runAsWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });
    const { threadId } = await runAsJony();

    await globalThis.testDataSource.query(
      `UPDATE "${WORKSPACE_SCHEMA}"."agentChatThread" SET "deletedAt" = NOW() WHERE id = $1`,
      [threadId],
    );

    await runAsJony();

    expect(await findThread(threadId)).toEqual({
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      deletedAt: null,
    });
  });

  it('should show a member only the text of a turn another member sent in the same thread', async () => {
    const threadKey = randomUUID();

    await runAgent({
      token: globalTestContext.janeApplicationToken,
      threadKey,
      steps: TOOL_CALL_STEPS,
    });

    const execution = await runAgent({
      token: globalTestContext.jonyApplicationToken,
      threadKey,
    });

    expect(execution.executionContext.authContext).toMatchObject({
      type: 'user',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    });

    const partTypes = findPriorMessagePartTypes(execution);

    expect(partTypes).toContain('text');
    expect(partTypes).not.toContain('tool-probe');
  });

  it('should show the owner only the text of a turn another member sent in their thread, with the tool output of the turns the application opened', async () => {
    const threadKey = randomUUID();
    const { threadId } = await runAgent({
      token: globalTestContext.jonyApplicationToken,
      threadKey,
      steps: TOOL_CALL_STEPS,
    });

    await runAgent({
      token: globalTestContext.janeApplicationToken,
      threadKey,
      steps: TOOL_CALL_STEPS,
    });

    await runAgent({
      token: globalTestContext.applicationToken,
      threadKey,
      steps: TOOL_CALL_STEPS,
    });

    const response = await makeMetadataApiRequest(
      {
        query: parse(
          'query($threadId: UUID!) { chatMessages(threadId: $threadId) { senderWorkspaceMemberId parts { type } } }',
        ),
        variables: { threadId },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const messages: {
      senderWorkspaceMemberId: string | null;
      parts: { type: string }[];
    }[] = response.body.data.chatMessages;
    const partTypes = messages.flatMap(({ parts }) =>
      parts.map(({ type }) => type),
    );

    expect(
      messages.map(({ senderWorkspaceMemberId }) => senderWorkspaceMemberId),
    ).toContain(WORKSPACE_MEMBER_DATA_SEED_IDS.JANE);
    expect(partTypes.filter((type) => type === 'tool-probe')).toHaveLength(2);
  });
});
