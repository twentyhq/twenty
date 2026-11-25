import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { type AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import {
  setUpChatThreadParticipantTests,
  SCHEMA,
  buildFutureSnoozedUntil,
  runInboxAction,
  findMyParticipant,
  readLastActivityAt,
  spyOnParticipantEvents,
  findParticipantEvents,
  listParticipantRecordIds,
  setShareWithJony,
} from 'test/integration/graphql/suites/chat-thread-participant/utils/chat-thread-participant-test.util';

describe('Chat thread participant inbox state through the authenticated API', () => {
  const { createTestThread } = setUpChatThreadParticipantTests();

  it('starts the owner with the new thread read and in the inbox', async () => {
    const threadId = await createTestThread();
    const participant = await findMyParticipant(threadId);
    const lastActivityAt = await readLastActivityAt(threadId);

    expect(participant).toMatchObject({
      archivedAt: null,
      snoozedUntil: null,
    });
    expect(new Date(participant!.lastReadAt!).getTime()).toBe(
      lastActivityAt.getTime(),
    );
  });

  it('refuses a member who cannot read the thread', async () => {
    const threadId = await createTestThread();
    const response = await runInboxAction('READ', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeUndefined();
  });

  it('writes every selected thread in one call, or none when one cannot be read', async () => {
    const threadIds = [await createTestThread(), await createTestThread()];

    await setShareWithJony(threadIds[0], true);

    const refused = await runInboxAction('ARCHIVE', threadIds, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(refused.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(
      await findMyParticipant(threadIds[0], APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeUndefined();

    await setShareWithJony(threadIds[1], true);

    const archived = await runInboxAction('ARCHIVE', threadIds, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(archived.body.errors).toBeUndefined();
    expect(archived.body.data.updateAgentChatThreadInboxState).toHaveLength(2);
    expect(archived.body.data.updateAgentChatThreadInboxState).toEqual(
      expect.arrayContaining(
        threadIds.map((threadId) =>
          expect.objectContaining({ threadId, archivedAt: expect.any(String) }),
        ),
      ),
    );
  });

  it('keeps a shared member state apart from the owner state', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);

    // A thread shared with a member they never opened has no state yet,
    // which reads as one they do not follow
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeUndefined();

    const archived = await runInboxAction('ARCHIVE', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(archived.body.errors).toBeUndefined();
    expect(
      archived.body.data.updateAgentChatThreadInboxState[0].archivedAt,
    ).not.toBeNull();
    expect(await findMyParticipant(threadId)).toMatchObject({
      archivedAt: null,
    });
  });

  it('never moves the read cursor past the latest activity or back', async () => {
    const threadId = await createTestThread();
    const lastActivityAt = await readLastActivityAt(threadId);

    const unread = await runInboxAction('UNREAD', threadId);

    expect(
      unread.body.data.updateAgentChatThreadInboxState[0].lastReadAt,
    ).toBeNull();

    const read = await runInboxAction('READ', threadId);

    expect(
      new Date(
        read.body.data.updateAgentChatThreadInboxState[0].lastReadAt,
      ).getTime(),
    ).toBe(lastActivityAt.getTime());

    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "lastActivityAt" = $2 WHERE id = $1`,
      [threadId, new Date(lastActivityAt.getTime() - 60_000)],
    );

    const readAgain = await runInboxAction('READ', threadId);

    expect(
      new Date(
        readAgain.body.data.updateAgentChatThreadInboxState[0].lastReadAt,
      ).getTime(),
    ).toBe(lastActivityAt.getTime());
  });

  it('snoozes only into the future and moves the thread back to the inbox', async () => {
    const threadId = await createTestThread();
    const pastSnooze = await runInboxAction('SNOOZE', threadId, {
      snoozedUntil: new Date(Date.now() - 60_000).toISOString(),
    });

    expect(pastSnooze.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');

    const snoozedUntil = buildFutureSnoozedUntil();
    const snoozed = await runInboxAction('SNOOZE', threadId, { snoozedUntil });

    expect(snoozed.body.errors).toBeUndefined();
    expect(
      snoozed.body.data.updateAgentChatThreadInboxState[0].archivedAt,
    ).not.toBeNull();
    expect(
      new Date(
        snoozed.body.data.updateAgentChatThreadInboxState[0].snoozedUntil,
      ).getTime(),
    ).toBe(new Date(snoozedUntil).getTime());

    const moved = await runInboxAction('MOVE_TO_INBOX', threadId);

    expect(moved.body.data.updateAgentChatThreadInboxState[0]).toMatchObject({
      archivedAt: null,
      snoozedUntil: null,
    });
  });

  it('sends each change as a record event carrying what changed', async () => {
    const eventSpy = spyOnParticipantEvents();
    const threadId = await createTestThread();

    await runInboxAction('UNREAD', threadId);
    await runInboxAction('UNREAD', threadId);
    await runInboxAction('ARCHIVE', threadId);

    expect(findParticipantEvents(eventSpy, threadId)).toEqual([
      { action: 'created', updatedFields: [] },
      { action: 'updated', updatedFields: ['lastReadAt', 'updatedAt'] },
      { action: 'updated', updatedFields: ['archivedAt', 'updatedAt'] },
    ]);
  });

  it('lets only its member read a row, through the grant it is given', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);
    await runInboxAction('ARCHIVE', threadId, {
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    const janeParticipant = await findMyParticipant(threadId);
    const jonyParticipant = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const ownerShares: { recordId: string; principalId: string }[] =
      await global.testDataSource.query(
        `SELECT "recordId", "principalId" FROM ${SCHEMA}."recordShare"
         WHERE "recordId" = ANY($1) AND "rowCause" = 'OWNER'
         ORDER BY "principalId"`,
        [[janeParticipant!.id, jonyParticipant!.id]],
      );
    const jonyRecordIds = await listParticipantRecordIds(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(ownerShares).toEqual(
      expect.arrayContaining([
        {
          recordId: janeParticipant!.id,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
        {
          recordId: jonyParticipant!.id,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        },
      ]),
    );
    expect(ownerShares).toHaveLength(2);
    expect(jonyRecordIds).toContain(jonyParticipant!.id);
    expect(jonyRecordIds).not.toContain(janeParticipant!.id);
  });

  it('ends a snooze once its time passes by moving the chat back to the inbox', async () => {
    const threadId = await createTestThread();

    await runInboxAction('SNOOZE', threadId, {
      snoozedUntil: buildFutureSnoozedUntil(),
    });

    const snoozedUntil = new Date(Date.now() - 1000);

    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThreadParticipant" SET "snoozedUntil" = $3
       WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
      [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, snoozedUntil],
    );

    const eventSpy = spyOnParticipantEvents();

    await getAppProviderByClassName<AgentChatThreadParticipantService>(
      'AgentChatThreadParticipantService',
    ).endSnooze({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      threadId,
      snoozedUntil: snoozedUntil.toISOString(),
    });

    const [row]: { archivedAt: Date | null; snoozedUntil: Date | null }[] =
      await global.testDataSource.query(
        `SELECT "archivedAt", "snoozedUntil" FROM ${SCHEMA}."agentChatThreadParticipant"
         WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
        [threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      );

    // The snooze stays recorded, so the chat shows what brought it back
    expect(row.archivedAt).toBeNull();
    expect(row.snoozedUntil?.getTime()).toBe(snoozedUntil.getTime());
    expect(findParticipantEvents(eventSpy, threadId)).toEqual([
      { action: 'updated', updatedFields: ['archivedAt', 'updatedAt'] },
    ]);
  });

  it('saves as ended a snooze whose time passed before it was saved', async () => {
    const threadId = await createTestThread();
    const snoozedUntil = new Date(Date.now() - 1000);

    // The snooze was accepted while its time was still ahead, and its
    // queued end already ran and found nothing to end
    const [participant] =
      await getAppProviderByClassName<AgentChatThreadParticipantService>(
        'AgentChatThreadParticipantService',
      ).updateInboxState({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        threadIds: [threadId],
        action: AgentChatInboxAction.SNOOZE,
        snoozedUntil,
      });

    expect(participant.archivedAt).toBeNull();
    expect(new Date(participant.snoozedUntil!).getTime()).toBe(
      snoozedUntil.getTime(),
    );
  });

  it('waits for the database clock before ending a snooze', async () => {
    const threadId = await createTestThread();
    const snoozedUntil = buildFutureSnoozedUntil();

    await runInboxAction('SNOOZE', threadId, { snoozedUntil });

    const eventSpy = spyOnParticipantEvents();

    await getAppProviderByClassName<AgentChatThreadParticipantService>(
      'AgentChatThreadParticipantService',
    ).endSnooze({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      threadId,
      snoozedUntil,
    });

    expect(findParticipantEvents(eventSpy, threadId)).toEqual([]);
    expect(await findMyParticipant(threadId)).toMatchObject({
      archivedAt: expect.any(String),
    });
  });

  it('leaves alone a snooze the member replaced since', async () => {
    const threadId = await createTestThread();

    await runInboxAction('SNOOZE', threadId, {
      snoozedUntil: buildFutureSnoozedUntil(),
    });

    const eventSpy = spyOnParticipantEvents();

    await getAppProviderByClassName<AgentChatThreadParticipantService>(
      'AgentChatThreadParticipantService',
    ).endSnooze({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      threadId,
      snoozedUntil: new Date(Date.now() - 1000).toISOString(),
    });

    expect(findParticipantEvents(eventSpy, threadId)).toEqual([]);
    expect(await findMyParticipant(threadId)).toMatchObject({
      archivedAt: expect.any(String),
    });
  });
});
