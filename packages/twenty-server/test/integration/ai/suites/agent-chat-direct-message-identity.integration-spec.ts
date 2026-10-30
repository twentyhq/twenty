import { randomUUID } from 'node:crypto';

import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type AgentChatDirectMessageIdentityService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-direct-message-identity.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type DirectMessageIdentity = {
  id: string;
  conversationType: string;
  directMessageFirstWorkspaceMemberId: string | null;
  directMessageSecondWorkspaceMemberId: string | null;
  workspaceMemberId: string | null;
  isAssistantParticipant: boolean;
  channelId: string | null;
  title: string | null;
  lastActivityAt: Date | null;
  deletedAt: Date | null;
};

describe('Canonical direct message identity', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;
  let service: AgentChatDirectMessageIdentityService;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
    service = getAppProviderByClassName<AgentChatDirectMessageIdentityService>(
      'AgentChatDirectMessageIdentityService',
    );
  });

  afterEach(async () => {
    await context.cleanup();
  });

  const getOrCreate = async ({
    firstWorkspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    secondWorkspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
  }: Partial<
    Omit<
      Parameters<AgentChatDirectMessageIdentityService['getOrCreate']>[0],
      'workspaceId'
    >
  > = {}) =>
    context.registerThread(
      await service.getOrCreate({
        workspaceId: context.workspaceId,
        firstWorkspaceMemberId,
        secondWorkspaceMemberId,
      }),
    );

  const readIdentity = async (threadId: string) => {
    const [identity]: DirectMessageIdentity[] =
      await global.testDataSource.query(
        `SELECT id, "conversationType", "directMessageFirstWorkspaceMemberId", "directMessageSecondWorkspaceMemberId",
                "workspaceMemberId", "isAssistantParticipant", "channelId", title, "lastActivityAt", "deletedAt"
         FROM "${context.schema}"."agentChatThread" WHERE id = $1`,
        [threadId],
      );

    return identity;
  };

  it('returns one identity for concurrent starts in both directions', async () => {
    const forwardPair = {
      firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    };
    const reversePair = {
      firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    };
    const threadIds = await Promise.all([
      getOrCreate(forwardPair),
      getOrCreate(reversePair),
      getOrCreate(forwardPair),
      getOrCreate(reversePair),
    ]);

    expect(new Set(threadIds).size).toBe(1);
    expect(await getOrCreate(reversePair)).toBe(threadIds[0]);

    const [count]: { count: number }[] = await global.testDataSource.query(
      `SELECT count(*)::int AS count FROM "${context.schema}"."agentChatThread"
       WHERE "directMessageFirstWorkspaceMemberId" = $1 AND "directMessageSecondWorkspaceMemberId" = $2`,
      [
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      ],
    );

    expect(count.count).toBe(1);
  });

  it('keeps different pairs and the same pair in another workspace independent', async () => {
    const janeAndJony = await getOrCreate();
    const janeAndTim = await getOrCreate({
      secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    });
    const otherWorkspacePair = await service.getOrCreate({
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    try {
      expect(new Set([janeAndJony, janeAndTim, otherWorkspacePair]).size).toBe(
        3,
      );
    } finally {
      await global.testDataSource.query(
        `DELETE FROM "${getWorkspaceSchemaName(SEED_YCOMBINATOR_WORKSPACE_ID)}"."agentChatThread" WHERE id = $1`,
        [otherWorkspacePair],
      );
    }
  });

  it('allocates a normalized dormant identity without inbox or assistant side effects', async () => {
    const threadId = await getOrCreate({
      firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY.toUpperCase(),
      secondWorkspaceMemberId:
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE.toUpperCase(),
    });

    expect(await readIdentity(threadId)).toEqual({
      id: threadId,
      conversationType: 'DIRECT_MESSAGE',
      directMessageFirstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      directMessageSecondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      workspaceMemberId: null,
      isAssistantParticipant: false,
      channelId: null,
      title: null,
      lastActivityAt: null,
      deletedAt: null,
    });

    const [counts]: {
      participants: number;
      messages: number;
      shares: number;
    }[] = await global.testDataSource.query(
      `SELECT
         (SELECT count(*)::int FROM "${context.schema}"."agentChatThreadParticipant" WHERE "threadId" = $1) AS participants,
         (SELECT count(*)::int FROM "${context.schema}"."agentMessage" WHERE "threadId" = $1) AS messages,
         (SELECT count(*)::int FROM "${context.schema}"."recordShare" WHERE "recordId" = $1) AS shares`,
      [threadId],
    );

    expect(counts).toEqual({ participants: 0, messages: 0, shares: 0 });
  });

  it('rejects duplicate pairs at the database boundary', async () => {
    await getOrCreate();

    await expect(
      global.testDataSource.query(
        `INSERT INTO "${context.schema}"."agentChatThread"
         (id, "conversationType", "directMessageFirstWorkspaceMemberId", "directMessageSecondWorkspaceMemberId")
         VALUES ($1, 'DIRECT_MESSAGE', $2, $3)`,
        [
          randomUUID(),
          WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        ],
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('retains a soft-deleted thread identity without restoring it', async () => {
    const threadId = await getOrCreate();

    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentChatThread" SET "deletedAt" = now() WHERE id = $1`,
      [threadId],
    );
    const deletedIdentity = await readIdentity(threadId);

    expect(await getOrCreate()).toBe(threadId);
    expect(await readIdentity(threadId)).toEqual(deletedIdentity);
    expect(deletedIdentity.deletedAt).not.toBeNull();
  });

  it('retains the human pair after Ada joins and a member becomes unavailable', async () => {
    const threadId = await getOrCreate();

    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentChatThread" SET "isAssistantParticipant" = true WHERE id = $1`,
      [threadId],
    );
    await global.testDataSource.query(
      `UPDATE "${context.schema}"."workspaceMember" SET "deletedAt" = now() WHERE id = $1`,
      [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    );

    try {
      expect(await getOrCreate()).toBe(threadId);
      expect(await readIdentity(threadId)).toMatchObject({
        directMessageFirstWorkspaceMemberId:
          WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        directMessageSecondWorkspaceMemberId:
          WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        isAssistantParticipant: true,
      });
    } finally {
      await global.testDataSource.query(
        `UPDATE "${context.schema}"."workspaceMember" SET "deletedAt" = null WHERE id = $1`,
        [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
      );
    }
  });

  it.each([
    {
      firstWorkspaceMemberId: 'invalid',
      secondWorkspaceMemberId: randomUUID(),
    },
    {
      firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      secondWorkspaceMemberId:
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE.toUpperCase(),
    },
  ])('rejects an invalid or self pair before allocating it', async (pair) => {
    await expect(getOrCreate(pair)).rejects.toMatchObject({
      code: AiExceptionCode.INVALID_AGENT_INPUT,
    });
  });

  it('rejects unknown members and members from another workspace', async () => {
    await expect(
      getOrCreate({ secondWorkspaceMemberId: randomUUID() }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    await expect(
      service.getOrCreate({
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.SCOTT,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
  });

  it.each([
    'directMessageFirstWorkspaceMemberId',
    'directMessageSecondWorkspaceMemberId',
  ])('prevents a client from changing %s', async (fieldName) => {
    const threadId = await context.createThread();
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'agentChatThread',
        gqlFields: 'id',
        recordId: threadId,
        data: { [fieldName]: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY },
      }),
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe(
      ErrorCode.FORBIDDEN,
    );
    expect(await readIdentity(threadId)).toMatchObject({
      conversationType: 'STANDARD',
      directMessageFirstWorkspaceMemberId: null,
      directMessageSecondWorkspaceMemberId: null,
    });
  });

  it('leaves ordinary chat creation and its personal inbox state unchanged', async () => {
    const firstThreadId = await context.createThread();
    const secondThreadId = await context.createThread();

    expect(firstThreadId).not.toBe(secondThreadId);
    expect(await readIdentity(firstThreadId)).toMatchObject({
      conversationType: 'STANDARD',
      directMessageFirstWorkspaceMemberId: null,
      directMessageSecondWorkspaceMemberId: null,
      workspaceMemberId: context.workspaceMemberId,
    });
    expect(await context.readParticipants(firstThreadId)).toEqual([
      expect.objectContaining({ workspaceMemberId: context.workspaceMemberId }),
    ]);
    expect(await readIdentity(secondThreadId)).toMatchObject({
      conversationType: 'STANDARD',
      directMessageFirstWorkspaceMemberId: null,
      directMessageSecondWorkspaceMemberId: null,
    });
  });
});
