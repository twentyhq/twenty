import { randomUUID } from 'node:crypto';
import { parse } from 'graphql';

import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type AgentChatDirectMessageIdentityService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-direct-message-identity.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { type PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { type RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
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

  const readIdentity = (threadId: string) =>
    global.testDataSource
      .createQueryBuilder()
      .select([
        'id',
        '"conversationType"',
        '"directMessageFirstWorkspaceMemberId"',
        '"directMessageSecondWorkspaceMemberId"',
        '"workspaceMemberId"',
        '"isAssistantParticipant"',
        '"channelId"',
        'title',
        '"lastActivityAt"',
        '"deletedAt"',
      ])
      .from(`${context.schema}.agentChatThread`, 'thread')
      .where('id = :threadId', { threadId })
      .getRawOne<DirectMessageIdentity>();

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

    const storedThreads = await global.testDataSource
      .createQueryBuilder()
      .select('id')
      .from(`${context.schema}.agentChatThread`, 'thread')
      .where(
        '"directMessageFirstWorkspaceMemberId" = :firstWorkspaceMemberId',
        {
          firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
      )
      .andWhere(
        '"directMessageSecondWorkspaceMemberId" = :secondWorkspaceMemberId',
        { secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY },
      )
      .getRawMany<{ id: string }>();

    expect(storedThreads).toHaveLength(1);
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
      await global.testDataSource
        .createQueryBuilder()
        .delete()
        .from(
          `${getWorkspaceSchemaName(SEED_YCOMBINATOR_WORKSPACE_ID)}.agentChatThread`,
        )
        .where('id = :threadId', { threadId: otherWorkspacePair })
        .execute();
    }
  });

  it('keeps new identities private', async () => {
    const threadId = await getOrCreate();
    const identity = await global.testDataSource
      .createQueryBuilder()
      .select(`thread."${IS_PRIVATE_COLUMN_NAME}"`, 'isPrivate')
      .from(`${context.schema}.agentChatThread`, 'thread')
      .where('thread.id = :threadId', { threadId })
      .getRawOne<{ isPrivate: boolean }>();

    expect(identity).toEqual({ isPrivate: true });
  });

  it.each(['agentChatThread', 'agentMessage'] as const)(
    'prevents a full-access pair member from changing %s sharing',
    async (objectName) => {
      const threadId = await getOrCreate();
      const message = await context.saveMessage({ threadId });
      const recordId = objectName === 'agentChatThread' ? threadId : message.id;
      const { flatObjectMetadataMaps } =
        await getAppProviderByClassName<WorkspaceCacheService>(
          'WorkspaceCacheService',
        ).getOrRecompute(context.workspaceId, ['flatObjectMetadataMaps']);
      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS[objectName].universalIdentifier
        ];

      assertIsDefinedOrThrow(flatObjectMetadata);

      const storage = getAppProviderByClassName<RecordShareStorageService>(
        'RecordShareStorageService',
      );
      const privateRecords =
        getAppProviderByClassName<PrivateRecordStorageService>(
          'PrivateRecordStorageService',
        );
      const manager = getAppProviderByClassName<WorkspaceOrmManager>(
        'WorkspaceOrmManager',
      );
      const target = { objectMetadataId: flatObjectMetadata.id, recordId };
      const storageTarget = {
        workspaceId: context.workspaceId,
        objectMetadataId: flatObjectMetadata.id,
        recordIds: [recordId],
      };

      await manager.executeInWorkspaceContext(
        () =>
          manager.runInWorkspaceTransaction(async (transactionScope) => {
            await privateRecords.setPrivate({
              workspaceId: context.workspaceId,
              flatObjectMetadata,
              recordIds: [recordId],
              isPrivate: true,
              transactionScope,
            });
            await storage.insertMany({
              workspaceId: context.workspaceId,
              transactionScope,
              recordShares: [
                WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
                WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
              ].map((principalId) => ({
                ...target,
                sourceId: threadId,
                principalId,
                principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
                accessLevel: RecordShareAccessLevel.FULL,
                rowCause: RecordShareRowCause.OWNER,
              })),
            });
          }),
        buildSystemAuthContext(context.workspaceId),
      );

      try {
        const sharesBefore = await storage.findByRecordIds(storageTarget);
        const sharing = await makeMetadataApiRequest({
          query: parse(`query Sharing($target: RecordTargetInput!) {
            recordSharing(target: $target) { isPrivate canManageSharing }
          }`),
          variables: { target },
        });

        expect(sharing.body).toMatchObject(
          objectName === 'agentMessage'
            ? { errors: [{ extensions: { code: ErrorCode.NOT_FOUND } }] }
            : {
                data: {
                  recordSharing: {
                    isPrivate: true,
                    canManageSharing: false,
                  },
                },
              },
        );

        const mutations = [
          {
            query: parse(`mutation MakePublic($target: RecordTargetInput!) {
              setRecordPrivate(target: $target, isPrivate: false) { isPrivate }
            }`),
            variables: { target },
          },
          {
            query:
              parse(`mutation ShareOutsidePair($target: RecordTargetInput!, $principal: RecordSharePrincipalInput!) {
              setRecordShare(target: $target, principal: $principal, accessLevel: FULL) { isPrivate }
            }`),
            variables: {
              target,
              principal: {
                workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
              },
            },
          },
          {
            query:
              parse(`mutation RemovePairShare($target: RecordTargetInput!, $principal: RecordSharePrincipalInput!) {
              removeRecordShare(target: $target, principal: $principal) { isPrivate }
            }`),
            variables: {
              target,
              principal: {
                workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
              },
            },
          },
        ];

        for (const mutation of mutations) {
          const response = await makeMetadataApiRequest(mutation);

          expect(response.body.errors?.[0]?.extensions?.code).toBe(
            ErrorCode.NOT_FOUND,
          );
        }

        const sharesAfter = await storage.findByRecordIds(storageTarget);
        const privateStates = await privateRecords.findStates({
          workspaceId: context.workspaceId,
          flatObjectMetadata,
          recordIds: [recordId],
        });

        expect(sharesAfter).toHaveLength(sharesBefore.length);
        expect(sharesAfter).toEqual(expect.arrayContaining(sharesBefore));
        expect(privateStates.get(recordId)?.isPrivate).toBe(true);
      } finally {
        await storage.deleteByRecordIds(storageTarget);
      }
    },
  );

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

    const [participants, messages, shares] = await Promise.all([
      global.testDataSource
        .createQueryBuilder()
        .select('id')
        .from(`${context.schema}.agentChatThreadParticipant`, 'participant')
        .where('"threadId" = :threadId', { threadId })
        .getRawMany<{ id: string }>(),
      global.testDataSource
        .createQueryBuilder()
        .select('id')
        .from(`${context.schema}.agentMessage`, 'message')
        .where('"threadId" = :threadId', { threadId })
        .getRawMany<{ id: string }>(),
      global.testDataSource
        .createQueryBuilder()
        .select('id')
        .from(`${context.schema}.recordShare`, 'share')
        .where('"recordId" = :threadId', { threadId })
        .getRawMany<{ id: string }>(),
    ]);

    expect(participants).toHaveLength(0);
    expect(messages).toHaveLength(0);
    expect(shares).toHaveLength(0);
  });

  it('rejects duplicate pairs at the database boundary', async () => {
    await getOrCreate();

    await expect(
      global.testDataSource
        .createQueryBuilder()
        .insert()
        .into(`${context.schema}.agentChatThread`)
        .values({
          id: randomUUID(),
          conversationType: 'DIRECT_MESSAGE',
          directMessageFirstWorkspaceMemberId:
            WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          directMessageSecondWorkspaceMemberId:
            WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        })
        .execute(),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('retains a soft-deleted thread identity without restoring it', async () => {
    const threadId = await getOrCreate();

    await global.testDataSource
      .createQueryBuilder()
      .update(`${context.schema}.agentChatThread`)
      .set({ deletedAt: new Date() })
      .where('id = :threadId', { threadId })
      .execute();
    const deletedIdentity = await readIdentity(threadId);

    expect(await getOrCreate()).toBe(threadId);
    expect(await readIdentity(threadId)).toEqual(deletedIdentity);
    expect(deletedIdentity).toMatchObject({ deletedAt: expect.anything() });
  });

  it('retains the human pair after Ada joins and a member becomes unavailable', async () => {
    const threadId = await getOrCreate();

    await global.testDataSource
      .createQueryBuilder()
      .update(`${context.schema}.agentChatThread`)
      .set({ isAssistantParticipant: true })
      .where('id = :threadId', { threadId })
      .execute();
    await global.testDataSource
      .createQueryBuilder()
      .update(`${context.schema}.workspaceMember`)
      .set({ deletedAt: new Date() })
      .where('id = :workspaceMemberId', {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      })
      .execute();

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
      await global.testDataSource
        .createQueryBuilder()
        .update(`${context.schema}.workspaceMember`)
        .set({ deletedAt: null })
        .where('id = :workspaceMemberId', {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        })
        .execute();
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

  it('rejects new pairs when a human has lost workspace membership', async () => {
    const membershipQuery = global.testDataSource
      .createQueryBuilder()
      .update('core.userWorkspace')
      .where('"workspaceId" = :workspaceId', {
        workspaceId: context.workspaceId,
      })
      .andWhere('"userId" = :userId', { userId: USER_DATA_SEED_IDS.JONY });

    const refreshWorkspaceMembers = () =>
      getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).invalidateAndRecompute(context.workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    await membershipQuery.clone().set({ deletedAt: new Date() }).execute();
    await refreshWorkspaceMembers();

    try {
      await expect(getOrCreate()).rejects.toMatchObject({
        code: AiExceptionCode.THREAD_NOT_FOUND,
      });
    } finally {
      await membershipQuery.clone().set({ deletedAt: null }).execute();
      await refreshWorkspaceMembers();
    }
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
