import { randomUUID } from 'node:crypto';
import { isDefined } from 'twenty-shared/utils';
import { assertGraphQLSuccessfulResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { listChatThreadIds } from 'test/integration/utils/list-chat-thread-ids.util';
import { type AgentChatThreadTriageService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-triage.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import {
  setUpChatChannelTests,
  SCHEMA,
  CREATE_CHANNEL,
  DELETE_CHANNEL,
  CHANNEL_ROLES,
  CREATE_THREAD,
  MOVE_THREAD,
  SNOOZE_IN_CHANNEL,
  ASSIGN,
  CHANNEL_THREAD_IDS,
  buildFutureSnoozedUntil,
  runThreadMutation,
  runInboxAction,
  findChannelThreadIds,
  getChannelSummaries,
  getOpenThreadCount,
  readMemberCopy,
  readChannelState,
  listChannels,
  readChannelGrants,
  readChannelGrantRoleIds,
  setRoleAllChannelsAccess,
  waitForChannelGrantRewrites,
  getChannelGrantService,
  waitForBlockedChannelGrantLock,
  countThreadsInChannel,
  insertChannelGrant,
  simulateNewMessageActivity,
} from 'test/integration/graphql/suites/chat-channel/utils/chat-channel-test.util';

const { JANE, JONY } = WORKSPACE_MEMBER_DATA_SEED_IDS;

describe('Chat channel access and triage through the authenticated API', () => {
  const {
    createdThreadIds,
    createChannel,
    updateChannel,
    createThreadInChannel,
    roleIdsToReopenToAllChannels,
    markChannelCacheStale,
    holdChannelGrantLock,
    closeMemberAllChannelsAccess,
  } = setUpChatChannelTests();

  it('creates a channel under a trimmed name, after General', async () => {
    const channelId = await createChannel();

    const [channel]: { name: string }[] = await global.testDataSource.query(
      `SELECT name FROM core."agentChatChannel" WHERE id = $1`,
      [channelId],
    );

    expect(channel.name.startsWith('Channel ')).toBe(true);
    expect(channel.name.endsWith(' ')).toBe(false);

    const channels = await listChannels(APPLE_JONY_MEMBER_ACCESS_TOKEN);

    const createdChannel = channels[channels.length - 1];

    expect(channels[0]).toMatchObject({ name: 'General', isCustom: false });
    expect(createdChannel).toMatchObject({
      id: channelId,
      isCustom: true,
      isAccessible: true,
    });
    expect(createdChannel.applicationId).not.toBe(channels[0].applicationId);
  });

  it('refuses a channel without a name, or with the name of another one', async () => {
    const response = await makeMetadataApiRequest({
      query: CREATE_CHANNEL,
      variables: { input: { name: '   ' } },
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');

    const duplicateResponse = await makeMetadataApiRequest({
      query: CREATE_CHANNEL,
      variables: { input: { name: 'General' } },
    });

    expect(duplicateResponse.body.errors[0].extensions.code).toBe(
      'METADATA_VALIDATION_FAILED',
    );
  });

  it('leaves setting channels up to who manages AI settings', async () => {
    const channelId = await createChannel();

    const createResponse = await makeMetadataApiRequest(
      { query: CREATE_CHANNEL, variables: { input: { name: 'By a member' } } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const updateResponse = await updateChannel(
      channelId,
      { name: 'Renamed by a member' },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const deleteResponse = await makeMetadataApiRequest(
      { query: DELETE_CHANNEL, variables: { channelId } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const rolesResponse = await makeMetadataApiRequest(
      { query: CHANNEL_ROLES },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    for (const response of [
      createResponse,
      updateResponse,
      deleteResponse,
      rolesResponse,
    ]) {
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    }
  });

  it('keeps General and its chats, as the standard sync would bring it back', async () => {
    const [general] = await listChannels();

    expect(general).toMatchObject({ name: 'General' });

    const destinationChannelId = await createChannel();
    const threadId = await createThreadInChannel(general.id);

    const response = await makeMetadataApiRequest({
      query: DELETE_CHANNEL,
      variables: { channelId: general.id, destinationChannelId },
    });

    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect((await readChannelState(threadId)).channelId).toBe(general.id);
  });

  it('lets the roles with access to all channels read and reply in its chats', async () => {
    const { id: adminRoleId } = await findOneRoleByLabel({ label: 'Admin' });
    const { id: memberRoleId } = await findOneRoleByLabel({ label: 'Member' });
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: channelId },
    ]);
    expect(await readChannelGrantRoleIds(threadId)).toEqual(
      expect.arrayContaining([adminRoleId, memberRoleId]),
    );
    expect(await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toContain(
      threadId,
    );
    expect(
      (
        await findChannelThreadIds(
          channelId,
          {},
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        )
      ).threadIds,
    ).toEqual([threadId]);

    assertGraphQLSuccessfulResponse(
      await runInboxAction(
        'SUBSCRIBE',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );
  });

  it('keeps a channel open to roles, and its chats, to who holds them', async () => {
    const { id: adminRoleId } = await findOneRoleByLabel({ label: 'Admin' });
    const memberRoleId = await closeMemberAllChannelsAccess();
    const channelId = await createChannel({ roleIds: [adminRoleId] });
    const threadId = await createThreadInChannel(channelId);

    expect(
      await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).not.toContain(threadId);
    expect(
      (await listChannels(APPLE_JONY_MEMBER_ACCESS_TOKEN)).map(({ id }) => id),
    ).not.toContain(channelId);

    for (const response of [
      await makeMetadataApiRequest(
        { query: CHANNEL_THREAD_IDS, variables: { channelId } },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
      await makeMetadataApiRequest(
        { query: CREATE_THREAD, variables: { channelId } },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    ]) {
      expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    }

    const openResponse = await updateChannel(channelId, {
      roleIds: [adminRoleId, memberRoleId],
    });

    assertGraphQLSuccessfulResponse(openResponse);
    expect(
      [...openResponse.body.data.updateAgentChatChannel.roleIds].sort(),
    ).toEqual([adminRoleId, memberRoleId].sort());
    expect(await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toContain(
      threadId,
    );
    expect(
      (await getChannelSummaries(APPLE_JONY_MEMBER_ACCESS_TOKEN)).find(
        (summary) => summary.channelId === channelId,
      ),
    ).toEqual({
      channelId,
      openCount: 1,
      assignedToMeCount: 0,
      snoozedCount: 0,
      doneCount: 0,
      hasUnreadOpen: true,
      hasUnreadAssignedToMe: false,
    });

    assertGraphQLSuccessfulResponse(
      await updateChannel(channelId, { roleIds: [adminRoleId] }),
    );

    expect(
      await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).not.toContain(threadId);
    expect(
      (await getChannelSummaries(APPLE_JONY_MEMBER_ACCESS_TOKEN)).map(
        (summary) => summary.channelId,
      ),
    ).not.toContain(channelId);
  });

  it('opens every channel to a role given access to all channels, and back', async () => {
    const memberRoleId = await closeMemberAllChannelsAccess();
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    await expectEventually(async () =>
      expect(
        await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
      ).not.toContain(threadId),
    );

    await setRoleAllChannelsAccess(memberRoleId, true);

    await expectEventually(async () =>
      expect(await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toContain(
        threadId,
      ),
    );
    expect(
      (await listChannels(APPLE_JONY_MEMBER_ACCESS_TOKEN)).find(
        ({ id }) => id === channelId,
      ),
    ).toMatchObject({ isAccessible: true });

    await setRoleAllChannelsAccess(memberRoleId, false);

    await expectEventually(async () =>
      expect(
        await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
      ).not.toContain(threadId),
    );
  });

  it('removes a role taken off a channel from a chat filed into it meanwhile', async () => {
    const memberRoleId = await closeMemberAllChannelsAccess();
    const channelId = await createChannel({ roleIds: [memberRoleId] });
    const threadId = await createThreadInChannel(null);
    const queryRunner = await holdChannelGrantLock({
      channelId,
      mode: 'shared',
    });

    await queryRunner.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "channelId" = $1 WHERE id = $2`,
      [channelId, threadId],
    );
    await insertChannelGrant({
      queryRunner,
      threadId,
      roleId: memberRoleId,
      channelId,
    });

    const pendingUpdateResponse = Promise.resolve(
      updateChannel(channelId, { roleIds: [] }),
    );

    await waitForBlockedChannelGrantLock(channelId);
    await queryRunner.commitTransaction();

    assertGraphQLSuccessfulResponse(await pendingUpdateResponse);
    expect(await readChannelGrantRoleIds(threadId)).not.toContain(memberRoleId);
  });

  it('grants a chat created in a channel the roles the channel has once it may write them', async () => {
    const memberRoleId = await closeMemberAllChannelsAccess();
    const channelId = await createChannel({ roleIds: [memberRoleId] });
    const queryRunner = await holdChannelGrantLock({
      channelId,
      mode: 'exclusive',
    });

    await queryRunner.query(
      `DELETE FROM core."agentChatChannelRole" WHERE "channelId" = $1 AND "roleId" = $2`,
      [channelId, memberRoleId],
    );
    markChannelCacheStale();

    const pendingCreateResponse = Promise.resolve(
      makeMetadataApiRequest({
        query: CREATE_THREAD,
        variables: { channelId },
      }),
    );

    await waitForBlockedChannelGrantLock(channelId);
    await queryRunner.commitTransaction();

    const createResponse = await pendingCreateResponse;

    assertGraphQLSuccessfulResponse(createResponse);

    const threadId = createResponse.body.data.createChatThread.id;

    createdThreadIds.push(threadId);

    expect(await readChannelGrantRoleIds(threadId)).not.toContain(memberRoleId);
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: channelId },
    ]);
  });

  it('drops the roles of the channel a chat leaves while that channel is rewritten', async () => {
    const memberRoleId = await closeMemberAllChannelsAccess();
    const sourceChannelId = await createChannel();
    const destinationChannelId = await createChannel();
    const threadId = await createThreadInChannel(sourceChannelId);
    const queryRunner = await holdChannelGrantLock({
      channelId: sourceChannelId,
      mode: 'exclusive',
    });

    const pendingMoveResponse = Promise.resolve(
      makeMetadataApiRequest({
        query: MOVE_THREAD,
        variables: { threadId, channelId: destinationChannelId },
      }),
    );

    await waitForBlockedChannelGrantLock(sourceChannelId);
    await insertChannelGrant({
      queryRunner,
      threadId,
      roleId: memberRoleId,
      channelId: sourceChannelId,
    });
    await queryRunner.commitTransaction();

    assertGraphQLSuccessfulResponse(await pendingMoveResponse);
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: destinationChannelId },
    ]);
    expect(await readChannelGrantRoleIds(threadId)).not.toContain(memberRoleId);
  });

  it("makes a chat moved into a channel wait for that channel's rewrite", async () => {
    const sourceChannelId = await createChannel();
    const destinationChannelId = await createChannel();
    const threadId = await createThreadInChannel(sourceChannelId);
    const queryRunner = await holdChannelGrantLock({
      channelId: destinationChannelId,
      mode: 'exclusive',
    });

    const pendingMoveResponse = Promise.resolve(
      makeMetadataApiRequest({
        query: MOVE_THREAD,
        variables: { threadId, channelId: destinationChannelId },
      }),
    );

    await waitForBlockedChannelGrantLock(destinationChannelId);
    await queryRunner.commitTransaction();

    assertGraphQLSuccessfulResponse(await pendingMoveResponse);
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: destinationChannelId },
    ]);
  });

  it("removes a role's access to all channels from a chat filed under the old access", async () => {
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(null);
    const { id: memberRoleId } = await findOneRoleByLabel({ label: 'Member' });
    const queryRunner = await holdChannelGrantLock({
      channelId,
      mode: 'shared',
    });

    await queryRunner.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "channelId" = $1 WHERE id = $2`,
      [channelId, threadId],
    );
    await insertChannelGrant({
      queryRunner,
      threadId,
      roleId: memberRoleId,
      channelId,
    });

    roleIdsToReopenToAllChannels.add(memberRoleId);
    await setRoleAllChannelsAccess(memberRoleId, false);

    await waitForBlockedChannelGrantLock(channelId);
    await queryRunner.commitTransaction();
    await waitForChannelGrantRewrites();

    expect(await readChannelGrantRoleIds(threadId)).not.toContain(memberRoleId);
  });

  it('refuses chats filed into a channel whose grants stay locked too long', async () => {
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(null);

    await holdChannelGrantLock({ channelId, mode: 'exclusive' });

    const [createResponse, moveResponse] = await Promise.all([
      makeMetadataApiRequest({
        query: CREATE_THREAD,
        variables: { channelId },
      }),
      makeMetadataApiRequest({
        query: MOVE_THREAD,
        variables: { threadId, channelId },
      }),
    ]);

    expect(createResponse.body.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      subCode: AiExceptionCode.CHAT_CHANNEL_BUSY,
    });
    expect(moveResponse.body.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      subCode: AiExceptionCode.CHAT_CHANNEL_BUSY,
    });
    expect((await readChannelState(threadId)).channelId).toBeNull();
    expect(await countThreadsInChannel(channelId)).toBe(0);
  });

  it("removes a role's access to all channels once a failed rewrite is retried", async () => {
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);
    const { id: memberRoleId } = await findOneRoleByLabel({ label: 'Member' });

    expect(await readChannelGrantRoleIds(threadId)).toContain(memberRoleId);

    const rewriteAllChannelGrants = jest
      .spyOn(getChannelGrantService(), 'rewriteAllChannelGrants')
      .mockRejectedValueOnce(new Error('Grant rewrite failed'));

    roleIdsToReopenToAllChannels.add(memberRoleId);
    await setRoleAllChannelsAccess(memberRoleId, false);
    await waitForChannelGrantRewrites();

    expect(rewriteAllChannelGrants).toHaveBeenCalledTimes(2);
    expect(await readChannelGrantRoleIds(threadId)).not.toContain(memberRoleId);
  });

  it("applies a channel's new access once a failed rewrite is retried", async () => {
    const memberRoleId = await closeMemberAllChannelsAccess();
    const channelId = await createChannel({ roleIds: [memberRoleId] });
    const threadId = await createThreadInChannel(channelId);

    expect(await readChannelGrantRoleIds(threadId)).toContain(memberRoleId);

    jest
      .spyOn(getChannelGrantService(), 'rewriteChannelGrants')
      .mockRejectedValueOnce(new Error('Grant rewrite failed'));

    const response = await updateChannel(channelId, { roleIds: [] });

    expect(response.body.errors).toBeDefined();

    await waitForChannelGrantRewrites();

    expect(await readChannelGrantRoleIds(threadId)).not.toContain(memberRoleId);
  });

  it("restores a channel's grants when its unchanged access is saved again", async () => {
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."recordShare" WHERE "recordId" = $1 AND "rowCause" = 'RULE'`,
      [threadId],
    );

    assertGraphQLSuccessfulResponse(
      await updateChannel(channelId, { roleIds: [] }),
    );
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: channelId },
    ]);
  });

  it("creates a chat under a destroyed chat's id while its channel is rewritten", async () => {
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    createdThreadIds.splice(createdThreadIds.indexOf(threadId), 1);
    await destroyAgentChatThread({ threadId });

    const queryRunner = await holdChannelGrantLock({
      channelId,
      mode: 'exclusive',
    });

    const pendingCreate = getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    ).createThreadIfMissing({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: JANE,
      threadId,
      channelId,
    });

    await waitForBlockedChannelGrantLock(channelId);
    await queryRunner.query(
      `DELETE FROM ${SCHEMA}."recordShare" WHERE "rowCause" = 'RULE' AND "sourceId" = $1`,
      [channelId],
    );
    await queryRunner.commitTransaction();
    await pendingCreate;
    createdThreadIds.push(threadId);

    expect((await readChannelState(threadId)).channelId).toBe(channelId);
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: channelId },
    ]);
  });

  it.each(['other', 'private'] as const)(
    "drops a destroyed chat's channel grants when its id comes back in the %s scope",
    async (destination) => {
      const channelId = await createChannel();
      const recreatedChannelId =
        destination === 'other' ? await createChannel() : undefined;
      const threadId = await createThreadInChannel(channelId);

      createdThreadIds.splice(createdThreadIds.indexOf(threadId), 1);
      await destroyAgentChatThread({ threadId });

      expect(await readChannelGrants(threadId)).toEqual([
        { principalType: 'ROLE', sourceId: channelId },
      ]);

      const threadService = getAppProviderByClassName<AgentChatThreadService>(
        'AgentChatThreadService',
      );

      await threadService.createThreadIfMissing({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspaceMemberId: JANE,
        threadId,
        channelId: recreatedChannelId,
      });
      createdThreadIds.push(threadId);

      expect(await readChannelGrants(threadId)).toEqual(
        isDefined(recreatedChannelId)
          ? [{ principalType: 'ROLE', sourceId: recreatedChannelId }]
          : [],
      );
    },
  );

  it('refuses a role from outside the workspace', async () => {
    const response = await makeMetadataApiRequest({
      query: CREATE_CHANNEL,
      variables: {
        input: {
          name: 'Channel with an unknown role',
          roleIds: [randomUUID()],
        },
      },
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('keeps chats a member only reads in a channel out of their own inbox', async () => {
    const channelId = await createChannel();
    const jonyOpenThreadCount = await getOpenThreadCount(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const threadId = await createThreadInChannel(channelId);

    assertGraphQLSuccessfulResponse(
      await runInboxAction('READ', threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    );

    expect(await readMemberCopy(threadId, JONY)).toMatchObject({
      isSubscribed: false,
    });
    expect(await getOpenThreadCount(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toBe(
      jonyOpenThreadCount,
    );

    // Filing it follows it, so new activity brings it back to his inbox
    assertGraphQLSuccessfulResponse(
      await runInboxAction('ARCHIVE', threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    );

    expect(await readMemberCopy(threadId, JONY)).toMatchObject({
      isSubscribed: true,
    });

    assertGraphQLSuccessfulResponse(
      await runInboxAction(
        'MOVE_TO_INBOX',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );

    expect(await getOpenThreadCount(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toBe(
      jonyOpenThreadCount + 1,
    );
    // The creator follows the chat they started
    expect(await readMemberCopy(threadId, JANE)).toMatchObject({
      isSubscribed: true,
      archivedAt: null,
    });
  });

  it('files a chat for the channel, and for whoever files it if they follow it', async () => {
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    assertGraphQLSuccessfulResponse(
      await runThreadMutation(
        'markAgentChatThreadAsDoneInChannel',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );

    expect(
      (await findChannelThreadIds(channelId, { status: 'DONE' })).threadIds,
    ).toEqual([threadId]);
    expect(
      (await findChannelThreadIds(channelId, { status: 'OPEN' })).threadIds,
    ).toEqual([]);
    // Jane follows it but did not file it, so it stays open for her
    expect((await readMemberCopy(threadId, JANE))?.archivedAt).toBeNull();
    // Jony did not follow it, so filing it for the channel leaves him out
    expect(
      (await readMemberCopy(threadId, JONY))?.archivedAt ?? null,
    ).toBeNull();

    assertGraphQLSuccessfulResponse(
      await runThreadMutation('reopenAgentChatThreadInChannel', threadId),
    );
    assertGraphQLSuccessfulResponse(
      await runThreadMutation('markAgentChatThreadAsDoneInChannel', threadId),
    );

    expect(await readMemberCopy(threadId, JANE)).toMatchObject({
      archivedAt: expect.anything(),
    });

    await simulateNewMessageActivity(threadId);

    expect(
      (await findChannelThreadIds(channelId, { status: 'OPEN' })).threadIds,
    ).toEqual([threadId]);
  });

  it('refuses channel triage on a chat outside any channel', async () => {
    const threadId = await createThreadInChannel(null);
    const response = await runThreadMutation(
      'markAgentChatThreadAsDoneInChannel',
      threadId,
    );

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it("files the channel's copy when the assignee files their own", async () => {
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: ASSIGN,
        variables: { threadId, assigneeWorkspaceMemberId: JONY },
      }),
    );

    expect(
      (await findChannelThreadIds(channelId, { assignment: 'UNASSIGNED' }))
        .threadIds,
    ).toEqual([]);
    expect(
      (
        await findChannelThreadIds(
          channelId,
          { assignment: 'ASSIGNED_TO_ME' },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        )
      ).threadIds,
    ).toEqual([threadId]);

    assertGraphQLSuccessfulResponse(
      await runInboxAction('ARCHIVE', threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    );

    expect((await readChannelState(threadId)).channelArchivedAt).not.toBeNull();

    assertGraphQLSuccessfulResponse(
      await runInboxAction(
        'SNOOZE',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
        buildFutureSnoozedUntil(),
      ),
    );

    expect(
      (await readChannelState(threadId)).channelSnoozedUntil,
    ).not.toBeNull();

    assertGraphQLSuccessfulResponse(
      await runInboxAction(
        'MOVE_TO_INBOX',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );

    expect(await readChannelState(threadId)).toMatchObject({
      channelArchivedAt: null,
      channelSnoozedUntil: null,
    });
    assertGraphQLSuccessfulResponse(
      await runInboxAction('ARCHIVE', threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    );

    // Anyone else filing their own copy leaves the channel's alone
    assertGraphQLSuccessfulResponse(
      await runThreadMutation(
        'reopenAgentChatThreadInChannel',
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    );
    assertGraphQLSuccessfulResponse(await runInboxAction('ARCHIVE', threadId));

    expect((await readChannelState(threadId)).channelArchivedAt).toBeNull();
  });

  it('snoozes a chat for the channel until its snooze ends', async () => {
    const channelId = await createChannel();
    const threadId = await createThreadInChannel(channelId);

    const pastResponse = await makeMetadataApiRequest({
      query: SNOOZE_IN_CHANNEL,
      variables: {
        threadId,
        snoozedUntil: new Date(Date.now() - 60_000).toISOString(),
      },
    });

    expect(pastResponse.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: SNOOZE_IN_CHANNEL,
        variables: { threadId, snoozedUntil: buildFutureSnoozedUntil() },
      }),
    );

    expect(
      (await findChannelThreadIds(channelId, { status: 'SNOOZED' })).threadIds,
    ).toEqual([threadId]);
    // The creator follows it, so their own copy is snoozed too
    expect(await readMemberCopy(threadId, JANE)).toMatchObject({
      snoozedUntil: expect.anything(),
    });

    const snoozedUntil = new Date(Date.now() - 1000);

    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "channelSnoozedUntil" = $2 WHERE id = $1`,
      [threadId, snoozedUntil],
    );

    const triageService =
      getAppProviderByClassName<AgentChatThreadTriageService>(
        'AgentChatThreadTriageService',
      );

    const replacedSnoozedUntil = new Date(Date.now() - 5000).toISOString();

    await triageService.endChannelSnooze({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      threadId,
      snoozedUntil: replacedSnoozedUntil,
    });

    expect((await readChannelState(threadId)).channelArchivedAt).not.toBeNull();

    await triageService.endChannelSnooze({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      threadId,
      snoozedUntil: snoozedUntil.toISOString(),
    });

    const channelState = await readChannelState(threadId);

    expect(channelState.channelArchivedAt).toBeNull();
    expect(channelState.channelSnoozedUntil?.getTime()).toBe(
      snoozedUntil.getTime(),
    );
  });

  it('moves a chat between channels and back out, starting it open', async () => {
    const { id: adminRoleId } = await findOneRoleByLabel({ label: 'Admin' });

    const memberRoleId = await closeMemberAllChannelsAccess();
    const sourceChannelId = await createChannel({ roleIds: [memberRoleId] });
    const destinationChannelId = await createChannel({
      roleIds: [adminRoleId],
    });
    const threadId = await createThreadInChannel(sourceChannelId);

    assertGraphQLSuccessfulResponse(
      await runThreadMutation('markAgentChatThreadAsDoneInChannel', threadId),
    );

    // Jony cannot reach the destination
    const refusedResponse = await makeMetadataApiRequest(
      {
        query: MOVE_THREAD,
        variables: { threadId, channelId: destinationChannelId },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(refusedResponse.body.errors[0].extensions.code).toBe('NOT_FOUND');

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: MOVE_THREAD,
        variables: { threadId, channelId: destinationChannelId },
      }),
    );

    expect(await readChannelState(threadId)).toEqual({
      channelId: destinationChannelId,
      channelArchivedAt: null,
      channelSnoozedUntil: null,
    });
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: destinationChannelId },
    ]);
    expect(
      await listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).not.toContain(threadId);

    assertGraphQLSuccessfulResponse(
      await makeMetadataApiRequest({
        query: MOVE_THREAD,
        variables: { threadId, channelId: null },
      }),
    );

    expect((await readChannelState(threadId)).channelId).toBeNull();
    expect(await readChannelGrants(threadId)).toEqual([]);
  });
});
