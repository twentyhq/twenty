import { type StepResult, type ToolSet } from 'ai';
import { randomUUID } from 'node:crypto';
import {
  type AgentRunExecution,
  captureAgentRunExecution,
} from 'test/integration/graphql/suites/user-session/utils/capture-agent-run-execution.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
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
  senderUserWorkspaceId: string | null;
  isSentThroughApplication: boolean;
  creatorWorkspaceMemberId: string | null;
};

const recordedTurnTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'an application token issued for a member runs the agent',
    context: {
      token: (globalContext) => globalContext.janeApplicationToken,
      senderUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      isSentThroughApplication: true,
      creatorWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    },
  },
  {
    title: 'a member session runs the agent',
    context: {
      token: () => APPLE_JONY_MEMBER_ACCESS_TOKEN,
      senderUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      isSentThroughApplication: false,
      creatorWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    },
  },
  {
    title: 'the application runs its own agent with no user',
    context: {
      token: (globalContext) => globalContext.applicationToken,
      senderUserWorkspaceId: null,
      isSentThroughApplication: true,
      creatorWorkspaceMemberId: null,
    },
  },
];

const findRecordedTurn = async (threadId: string) => {
  const [[message], [turn]] = await Promise.all([
    globalThis.testDataSource.query(
      `SELECT "senderUserWorkspaceId", "senderApplicationId"
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

const findPriorMessagePartTypes = ({ priorMessages }: AgentRunExecution) =>
  (priorMessages ?? []).flatMap(({ parts }) => parts.map(({ type }) => type));

describe('Agent run conversation should be recorded for the caller', () => {
  let application: ApplicationWithResources;
  let globalTestContext: GlobalTestContext;
  const threadIds: string[] = [];

  const runAgent = async ({
    token,
    threadKey,
    steps,
  }: {
    token: string;
    threadKey?: string;
    steps?: StepResult<ToolSet>[];
  }) => {
    const execution = await captureAgentRunExecution({
      agentUniversalIdentifier: globalTestContext.agentUniversalIdentifier,
      token,
      thread: isDefined(threadKey) ? { key: threadKey } : undefined,
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
    // no member is granted the threads runAgent creates, so the API cannot destroy them
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
        senderUserWorkspaceId: context.senderUserWorkspaceId,
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
});
