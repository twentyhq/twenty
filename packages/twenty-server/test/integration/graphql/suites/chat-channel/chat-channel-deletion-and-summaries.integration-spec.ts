import { randomUUID } from 'node:crypto';
import { parse } from 'graphql';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { assertGraphQLSuccessfulResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { detachAgentChatChannelThreadsFromWorkspaceMember } from 'src/engine/metadata-modules/ai/ai-chat/utils/detach-agent-chat-channel-threads-from-workspace-member.util';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { getAgentHistoryRepositoryToken } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import {
  setUpChatChannelTests,
  SCHEMA,
  DELETE_CHANNEL,
  CREATE_THREAD,
  MOVE_THREAD,
  SNOOZE_IN_CHANNEL,
  ASSIGN,
  CHANNEL_THREAD_IDS,
  buildFutureSnoozedUntil,
  runThreadMutation,
  findChannelThreadIds,
  getChannelSummaries,
  getOpenThreadCount,
  readChannelState,
  listChannels,
  readChannelGrants,
  isChannelInCore,
  countThreadsInChannel,
  watchThreadEvents,
  getChannelMetadataService,
  deleteChannelBehindStaleCache,
  simulateNewMessageActivity,
} from 'test/integration/graphql/suites/chat-channel/utils/chat-channel-test.util';

const { JANE, JONY } = WORKSPACE_MEMBER_DATA_SEED_IDS;

describe('Chat channel deletion and summaries through the authenticated API', () => {
  const {
    createdThreadIds,
    createChannel,
    createThreadInChannel,
    holdChannelDeletionLock,
    fileThreadIntoHeldChannel,
  } = setUpChatChannelTests();

  it('deletes a channel only once its chats have somewhere to go', async () => {
    const channelId = await createChannel();
    const destinationChannelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    const refusedResponse = await makeMetadataApiRequest({
      query: DELETE_CHANNEL,
      variables: { channelId },
    });

    expect(refusedResponse.body.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      subCode: AiExceptionCode.CHAT_CHANNEL_NOT_EMPTY,
    });

    const selfResponse = await makeMetadataApiRequest({
      query: DELETE_CHANNEL,
      variables: { channelId, destinationChannelId: channelId },
    });

    expect(selfResponse.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');

    const { findEmittedThreadEvent } = watchThreadEvents();

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId, destinationChannelId },
      }),
    );

    expect((await readChannelState(threadId)).channelId).toBe(
      destinationChannelId,
    );
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: destinationChannelId },
    ]);
    expect((await listChannels()).map(({ id }) => id)).not.toContain(channelId);
    // Moved in SQL, so the move is sent for clients watching the chat
    expect(findEmittedThreadEvent(threadId)).toMatchObject({
      properties: {
        updatedFields: ['channelId'],
        diff: { channelId: { before: channelId, after: destinationChannelId } },
      },
    });
  });

  it('refuses chats in a channel while it is being deleted', async () => {
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(null);
    const channelMetadataService = getChannelMetadataService();
    const deleteChannelMetadata = channelMetadataService.deleteChannel.bind(
      channelMetadataService,
    );
    const writeIntoChannel = jest.fn(() =>
      Promise.all([
        makeMetadataApiRequest({
          query: CREATE_THREAD,
          variables: { channelId },
        }),
        makeMetadataApiRequest({
          query: MOVE_THREAD,
          variables: { threadId, channelId },
        }),
        getAppProviderByClassName<AgentChatThreadService>(
          'AgentChatThreadService',
        )
          .createThreadIfMissing({
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            workspaceMemberId: JANE,
            threadId: randomUUID(),
            channelId,
          })
          .catch((error: unknown) => error),
      ]),
    );

    jest
      .spyOn(channelMetadataService, 'deleteChannel')
      .mockImplementationOnce(async (args) => {
        await writeIntoChannel();

        return deleteChannelMetadata(args);
      });

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId },
      }),
    );

    const [createResponse, moveResponse, createThreadIfMissingError] =
      await writeIntoChannel.mock.results[0].value;

    expect(createResponse.body.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      subCode: AiExceptionCode.CHAT_CHANNEL_BUSY,
    });
    expect(moveResponse.body.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      subCode: AiExceptionCode.CHAT_CHANNEL_BUSY,
    });
    expect(createThreadIfMissingError).toMatchObject({
      code: AiExceptionCode.CHAT_CHANNEL_BUSY,
    });
    expect((await readChannelState(threadId)).channelId).toBeNull();
    expect(await countThreadsInChannel(channelId)).toBe(0);
    expect(await isChannelInCore(channelId)).toBe(false);
  });

  it('moves a chat filed into a channel just before its deletion takes the lock', async () => {
    const channelId = await createChannel();
    const destinationChannelId = await createChannel();
    const threadId = await createThreadInChannel(null);
    const queryRunner = await fileThreadIntoHeldChannel({
      threadId,
      channelId,
    });
    const advisoryLockService =
      getAppProviderByClassName<PostgresAdvisoryLockService>(
        'PostgresAdvisoryLockService',
      );
    const tryWithLock =
      advisoryLockService.tryWithLock.bind(advisoryLockService);

    jest
      .spyOn(advisoryLockService, 'tryWithLock')
      .mockImplementationOnce(async (lockName, callback) => {
        await queryRunner.commitTransaction();

        return tryWithLock(lockName, callback);
      });

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId, destinationChannelId },
      }),
    );
    expect((await readChannelState(threadId)).channelId).toBe(
      destinationChannelId,
    );
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: destinationChannelId },
    ]);
    expect(await isChannelInCore(channelId)).toBe(false);
  });

  it('refuses to delete a channel while a chat is being filed into it', async () => {
    const channelId = await createChannel();
    const destinationChannelId = await createChannel();
    const threadId = await createThreadInChannel(null);
    const queryRunner = await fileThreadIntoHeldChannel({
      threadId,
      channelId,
    });

    const refusedResponse = await makeMetadataApiRequest({
      query: DELETE_CHANNEL,
      variables: { channelId, destinationChannelId },
    });

    expect(refusedResponse.body.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      subCode: AiExceptionCode.CHAT_CHANNEL_BUSY,
    });
    expect(await isChannelInCore(channelId)).toBe(true);

    await queryRunner.commitTransaction();

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId, destinationChannelId },
      }),
    );
    expect((await readChannelState(threadId)).channelId).toBe(
      destinationChannelId,
    );
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: destinationChannelId },
    ]);
    expect(await isChannelInCore(channelId)).toBe(false);
  });

  it('refuses chats in a deleted channel that a stale cache still lists', async () => {
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(null);

    await deleteChannelBehindStaleCache(channelId);

    const createResponse = await makeMetadataApiRequest({
      query: CREATE_THREAD,
      variables: { channelId },
    });
    const moveResponse = await makeMetadataApiRequest({
      query: MOVE_THREAD,
      variables: { threadId, channelId },
    });

    expect(createResponse.body.errors[0].extensions).toMatchObject({
      code: 'NOT_FOUND',
      subCode: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
    });
    expect(moveResponse.body.errors[0].extensions).toMatchObject({
      code: 'NOT_FOUND',
      subCode: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
    });
    expect(await countThreadsInChannel(channelId)).toBe(0);
    expect((await readChannelState(threadId)).channelId).toBeNull();
  });

  it('keeps chats out of a deleted destination that a stale cache still lists', async () => {
    const channelId = await createChannel();
    const destinationChannelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    await deleteChannelBehindStaleCache(destinationChannelId);

    const deleteResponse = await makeMetadataApiRequest({
      query: DELETE_CHANNEL,
      variables: { channelId, destinationChannelId },
    });

    expect(deleteResponse.body.errors[0].extensions).toMatchObject({
      code: 'NOT_FOUND',
      subCode: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
    });
    expect(await isChannelInCore(channelId)).toBe(true);
    expect((await readChannelState(threadId)).channelId).toBe(channelId);
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: channelId },
    ]);
  });

  it('refuses to move chats into a channel that is being deleted', async () => {
    const channelId = await createChannel();
    const destinationChannelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    await holdChannelDeletionLock(destinationChannelId);

    const deleteResponse = await makeMetadataApiRequest({
      query: DELETE_CHANNEL,
      variables: { channelId, destinationChannelId },
    });

    expect(deleteResponse.body.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      subCode: AiExceptionCode.CHAT_CHANNEL_BUSY,
    });
    expect(await isChannelInCore(channelId)).toBe(true);
    expect((await readChannelState(threadId)).channelId).toBe(channelId);
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: channelId },
    ]);
  });

  it('announces the chats it moved when the channel cannot be deleted afterwards', async () => {
    const channelId = await createChannel();
    const destinationChannelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);
    const { findEmittedThreadEvent } = watchThreadEvents();

    jest
      .spyOn(getChannelMetadataService(), 'deleteChannel')
      .mockRejectedValueOnce(new Error('Metadata delete failed'));

    const deleteResponse = await makeMetadataApiRequest({
      query: DELETE_CHANNEL,
      variables: { channelId, destinationChannelId },
    });

    expect(deleteResponse.body.errors).toBeDefined();
    expect((await readChannelState(threadId)).channelId).toBe(
      destinationChannelId,
    );
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: destinationChannelId },
    ]);
    expect(await isChannelInCore(channelId)).toBe(true);
    expect(findEmittedThreadEvent(threadId)).toMatchObject({
      properties: {
        updatedFields: ['channelId'],
        diff: { channelId: { before: channelId, after: destinationChannelId } },
      },
    });

    await createThreadInChannel(channelId);
  });

  it('deletes two channels into each other without leaving a chat behind', async () => {
    const firstChannelId = await createChannel();
    const secondChannelId = await createChannel();
    const firstThreadId = await createThreadInChannel(firstChannelId);
    const secondThreadId = await createThreadInChannel(secondChannelId);

    const deleteResponses = await Promise.all([
      makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: {
          channelId: firstChannelId,
          destinationChannelId: secondChannelId,
        },
      }),
      makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: {
          channelId: secondChannelId,
          destinationChannelId: firstChannelId,
        },
      }),
    ]);
    const failedDeleteResponses = deleteResponses.filter(({ body }) =>
      isDefined(body.errors),
    );

    expect(failedDeleteResponses.length).toBeGreaterThanOrEqual(1);
    for (const { body } of failedDeleteResponses) {
      expect([
        AiExceptionCode.CHAT_CHANNEL_BUSY,
        AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
      ]).toContain(body.errors[0].extensions.subCode);
    }
    for (const threadId of [firstThreadId, secondThreadId]) {
      const { channelId } = await readChannelState(threadId);

      expect(isDefined(channelId) && (await isChannelInCore(channelId))).toBe(
        true,
      );
    }
  });

  it('pins a channel to the sidebar until the channel is deleted', async () => {
    const channelId = await createChannel();

    const { errors: missingChannelErrors } = await createNavigationMenuItem({
      input: { type: NavigationMenuItemType.AGENT_CHAT_CHANNEL },
      expectToFail: true,
    });

    expect(missingChannelErrors).toBeDefined();

    const { data } = await createNavigationMenuItem({
      input: {
        type: NavigationMenuItemType.AGENT_CHAT_CHANNEL,
        agentChatChannelId: channelId,
      },
      gqlFields: 'id agentChatChannelId',
    });
    const navigationMenuItemId = data.createNavigationMenuItem.id;

    expect(data.createNavigationMenuItem.agentChatChannelId).toBe(channelId);

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: DELETE_CHANNEL,
        variables: { channelId },
      }),
    );

    const { data: afterDeleteData } = await findNavigationMenuItems({
      input: undefined,
      gqlFields: 'id',
    });

    expect(
      afterDeleteData.navigationMenuItems.map(({ id }) => id),
    ).not.toContain(navigationMenuItemId);
  });

  it('counts open chats for each channel the member reaches, and their own only once they follow', async () => {
    const channelId = await createChannel();
    const janeOpenThreadCount = await getOpenThreadCount();
    const jonyOpenThreadCount = await getOpenThreadCount(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const threadId = await createThreadInChannel(channelId);
    const doneThreadId = await createThreadInChannel(channelId);

    assertGraphQLSuccessfulResponse(
      await runThreadMutation(
        'markAgentChatThreadAsDoneInChannel',
        doneThreadId,
      ),
    );
    await simulateNewMessageActivity(threadId);

    for (const token of [
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    ]) {
      expect(
        (await getChannelSummaries(token)).find(
          (summary) => summary.channelId === channelId,
        ),
      ).toEqual({
        channelId,
        openCount: 1,
        assignedToMeCount: 0,
        snoozedCount: 0,
        doneCount: 1,
        hasUnreadOpen: true,
        hasUnreadAssignedToMe: false,
      });
    }

    // Jane follows both chats she started, so filing one for the channel
    // files her own copy too
    expect(await getOpenThreadCount()).toBe(janeOpenThreadCount + 1);
    expect(await getOpenThreadCount(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toBe(
      jonyOpenThreadCount,
    );
  });

  it('counts each channel status and unread open chats assigned to the requesting member', async () => {
    const channelId = await createChannel();

    expect(
      (await getChannelSummaries()).find(
        (summary) => summary.channelId === channelId,
      ),
    ).toEqual({
      channelId,
      openCount: 0,
      assignedToMeCount: 0,
      snoozedCount: 0,
      doneCount: 0,
      hasUnreadOpen: false,
      hasUnreadAssignedToMe: false,
    });

    const threadId = await createThreadInChannel(channelId);

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: ASSIGN,
        variables: { threadId, assigneeWorkspaceMemberId: JONY },
      }),
    );
    await simulateNewMessageActivity(threadId);

    expect(
      (await getChannelSummaries()).find(
        (summary) => summary.channelId === channelId,
      ),
    ).toMatchObject({
      openCount: 1,
      assignedToMeCount: 0,
      hasUnreadAssignedToMe: false,
    });
    expect(
      (await getChannelSummaries(APPLE_JONY_MEMBER_ACCESS_TOKEN)).find(
        (summary) => summary.channelId === channelId,
      ),
    ).toEqual({
      channelId,
      openCount: 1,
      assignedToMeCount: 1,
      snoozedCount: 0,
      doneCount: 0,
      hasUnreadOpen: true,
      hasUnreadAssignedToMe: true,
    });

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: SNOOZE_IN_CHANNEL,
        variables: { threadId, snoozedUntil: buildFutureSnoozedUntil() },
      }),
    );

    expect(
      (await getChannelSummaries(APPLE_JONY_MEMBER_ACCESS_TOKEN)).find(
        (summary) => summary.channelId === channelId,
      ),
    ).toEqual({
      channelId,
      openCount: 0,
      assignedToMeCount: 0,
      snoozedCount: 1,
      doneCount: 0,
      hasUnreadOpen: false,
      hasUnreadAssignedToMe: false,
    });

    assertGraphQLSuccessfulResponse(
      await runThreadMutation('markAgentChatThreadAsDoneInChannel', threadId),
    );

    expect(
      (await getChannelSummaries(APPLE_JONY_MEMBER_ACCESS_TOKEN)).find(
        (summary) => summary.channelId === channelId,
      ),
    ).toEqual({
      channelId,
      openCount: 0,
      assignedToMeCount: 0,
      snoozedCount: 0,
      doneCount: 1,
      hasUnreadOpen: false,
      hasUnreadAssignedToMe: false,
    });
  });

  it('narrows open channel chats to those waiting on an answer or mentioning the member', async () => {
    const channelId = await createChannel();
    const needsInputThreadId = await createThreadInChannel(channelId);
    const mentionedThreadId = await createThreadInChannel(channelId);

    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "pendingQuestionMessageId" = $1 WHERE id = $2`,
      [randomUUID(), needsInputThreadId],
    );
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThreadParticipant" SET "lastMentionedAt" = now()
       WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
      [mentionedThreadId, JANE],
    );

    expect(
      (await findChannelThreadIds(channelId, { filter: 'NEEDS_INPUT' }))
        .threadIds,
    ).toEqual([needsInputThreadId]);
    expect(
      (await findChannelThreadIds(channelId, { filter: 'MENTIONED' }))
        .threadIds,
    ).toEqual([mentionedThreadId]);
    expect(
      (
        await findChannelThreadIds(
          channelId,
          { filter: 'MENTIONED' },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        )
      ).threadIds,
    ).toEqual([]);

    const response = await makeMetadataApiRequest({
      query: parse(
        `query Summaries { agentChatChannelSummaries { channelId needsInputCount mentionedCount assignedCount unassignedCount } }`,
      ),
    });

    assertGraphQLSuccessfulResponse(response);
    expect(
      response.body.data.agentChatChannelSummaries.find(
        (summary: { channelId: string }) => summary.channelId === channelId,
      ),
    ).toEqual({
      channelId,
      needsInputCount: 1,
      mentionedCount: 1,
      assignedCount: 0,
      unassignedCount: 2,
    });
  });

  it('narrows open channel chats to assigned ones and keeps resolved mentions out', async () => {
    const channelId = await createChannel();
    const assignedThreadId = await createThreadInChannel(channelId);
    const unassignedThreadId = await createThreadInChannel(channelId);

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: ASSIGN,
        variables: {
          threadId: assignedThreadId,
          assigneeWorkspaceMemberId: JONY,
        },
      }),
    );
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThreadParticipant"
       SET "lastMentionedAt" = now(), "mentionsResolvedAt" = now()
       WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
      [unassignedThreadId, JANE],
    );

    expect(
      (await findChannelThreadIds(channelId, { assignment: 'ASSIGNED' }))
        .threadIds,
    ).toEqual([assignedThreadId]);
    expect(
      (await findChannelThreadIds(channelId, { assignment: 'UNASSIGNED' }))
        .threadIds,
    ).toEqual([unassignedThreadId]);
    expect(
      (await findChannelThreadIds(channelId, { filter: 'MENTIONED' }))
        .threadIds,
    ).toEqual([]);
  });

  it('keeps the channel chats of a removed member in their channel', async () => {
    const channelId = await createChannel();
    const channelThreadId = await createThreadInChannel(
      channelId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const ownThreadId = await createThreadInChannel(
      null,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const { flatFieldMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatFieldMetadataMaps']);

    await detachAgentChatChannelThreadsFromWorkspaceMember({
      threadRepository: global.app.get<
        string,
        AgentHistoryRepository<AgentChatThreadWorkspaceEntity>
      >(getAgentHistoryRepositoryToken('agentChatThread'), { strict: false }),
      flatFieldMetadataMaps,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: JONY,
    });

    const owners: { id: string; workspaceMemberId: string | null }[] =
      await global.testDataSource.query(
        `SELECT id, "workspaceMemberId" FROM ${SCHEMA}."agentChatThread"
         WHERE id = ANY($1::uuid[]) ORDER BY id`,
        [[channelThreadId, ownThreadId]],
      );

    expect(owners).toEqual(
      [
        { id: channelThreadId, workspaceMemberId: null },
        { id: ownThreadId, workspaceMemberId: JONY },
      ].sort((threadA, threadB) => threadA.id.localeCompare(threadB.id)),
    );

    const leaveResponse = await makeMetadataApiRequest({
      query: MOVE_THREAD,
      variables: { threadId: channelThreadId, channelId: null },
    });

    expect(leaveResponse.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');

    // Neither chat is Jane's to destroy any more
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."agentChatThread" WHERE id = ANY($1::uuid[])`,
      [[channelThreadId, ownThreadId]],
    );
    createdThreadIds.splice(
      0,
      createdThreadIds.length,
      ...createdThreadIds.filter(
        (threadId) => ![channelThreadId, ownThreadId].includes(threadId),
      ),
    );
  });

  it('pages a channel by last activity', async () => {
    const channelId = await createChannel();
    const olderThreadId = await createThreadInChannel(channelId);
    const newerThreadId = await createThreadInChannel(channelId);

    await simulateNewMessageActivity(newerThreadId);

    const firstPage = await findChannelThreadIds(
      channelId,
      {},
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      { first: 1 },
    );

    expect(firstPage).toMatchObject({
      threadIds: [newerThreadId],
      hasNextPage: true,
    });

    const secondPage = await findChannelThreadIds(
      channelId,
      {},
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      { first: 1, after: firstPage.endCursor! },
    );

    expect(secondPage).toMatchObject({
      threadIds: [olderThreadId],
      hasNextPage: false,
    });

    const invalidResponse = await makeMetadataApiRequest({
      query: CHANNEL_THREAD_IDS,
      variables: { channelId, after: 'not-a-cursor' },
    });

    expect(invalidResponse.body.errors[0].extensions.code).toBe(
      'BAD_USER_INPUT',
    );
  });
});
