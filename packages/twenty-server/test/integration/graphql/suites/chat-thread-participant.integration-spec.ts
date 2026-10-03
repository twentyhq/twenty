import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setManualRecordShare } from 'test/integration/utils/set-manual-record-share.util';

import { type AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const PARTICIPANT_FIELDS = 'threadId lastReadAt archivedAt snoozedUntil';

const MY_PARTICIPANTS = parse(
  `query MyParticipants($threadIds: [UUID!]!) { myAgentChatThreadParticipants(threadIds: $threadIds) { ${PARTICIPANT_FIELDS} } }`,
);

const buildThreadMutation = (name: string) =>
  parse(
    `mutation Run($threadId: UUID!) { ${name}(threadId: $threadId) { ${PARTICIPANT_FIELDS} } }`,
  );

const SNOOZE = parse(
  `mutation Snooze($threadId: UUID!, $snoozedUntil: DateTime!) { snoozeAgentChatThread(threadId: $threadId, snoozedUntil: $snoozedUntil) { ${PARTICIPANT_FIELDS} } }`,
);

type Participant = {
  threadId: string;
  lastReadAt: string | null;
  archivedAt: string | null;
  snoozedUntil: string | null;
};

const runThreadMutation = (
  name: string,
  threadId: string,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeMetadataApiRequest(
    { query: buildThreadMutation(name), variables: { threadId } },
    token,
  );

const findMyParticipant = async (
  threadId: string,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
): Promise<Participant | undefined> => {
  const response = await makeMetadataApiRequest(
    { query: MY_PARTICIPANTS, variables: { threadIds: [threadId] } },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return (
    response.body.data.myAgentChatThreadParticipants as Participant[]
  ).find((participant) => participant.threadId === threadId);
};

const readThreadActivity = async (threadId: string) => {
  const [row]: {
    lastActivityAt: Date;
    lastMessageText: string | null;
    lastMessageSenderWorkspaceMemberId: string | null;
    writerWorkspaceMemberIds: string[] | null;
  }[] = await global.testDataSource.query(
    `SELECT "lastActivityAt", "lastMessageText", "lastMessageSenderWorkspaceMemberId", "writerWorkspaceMemberIds"
     FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
    [threadId],
  );

  return row;
};

const readLastActivityAt = async (threadId: string): Promise<Date> =>
  (await readThreadActivity(threadId)).lastActivityAt;

const createThread = async (): Promise<string> => {
  const threadId = randomUUID();

  await getAppProviderByClassName<AgentChatThreadService>(
    'AgentChatThreadService',
  ).createThread({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    id: threadId,
    title: 'Participant state',
  });

  return threadId;
};

const setShareWithJony = async (threadId: string, enabled: boolean) => {
  const { flatObjectMetadataMaps } =
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatObjectMetadataMaps']);

  await setManualRecordShare({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    share: {
      objectMetadataId:
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ]!.id,
      recordId: threadId,
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      accessLevel: RecordShareAccessLevel.READ,
      sourceId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    },
    enabled,
  });
};

describe('Chat thread participant state through the authenticated API', () => {
  const createdThreadIds: string[] = [];

  const createTestThread = async () => {
    const threadId = await createThread();

    createdThreadIds.push(threadId);

    return threadId;
  };

  afterEach(async () => {
    for (const threadId of createdThreadIds.splice(0)) {
      await setShareWithJony(threadId, false);
      await destroyAgentChatThread({ threadId });
    }
  });

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

  it('returns only the threads asked for', async () => {
    const askedThreadId = await createTestThread();
    await createTestThread();

    const response = await makeMetadataApiRequest(
      { query: MY_PARTICIPANTS, variables: { threadIds: [askedThreadId] } },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      (response.body.data.myAgentChatThreadParticipants as Participant[]).map(
        ({ threadId }) => threadId,
      ),
    ).toEqual([askedThreadId]);
  });

  it('refuses a member who cannot read the thread', async () => {
    const threadId = await createTestThread();
    const response = await runThreadMutation(
      'markAgentChatThreadAsRead',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeUndefined();
  });

  it('keeps a shared member state apart from the owner state', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);

    // A thread shared with a member they never opened has no state yet,
    // which reads as unread
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeUndefined();

    const archived = await runThreadMutation(
      'archiveAgentChatThread',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(archived.body.errors).toBeUndefined();
    expect(archived.body.data.archiveAgentChatThread.archivedAt).not.toBeNull();
    expect(await findMyParticipant(threadId)).toMatchObject({
      archivedAt: null,
    });
  });

  it('never moves the read cursor past the latest activity or back', async () => {
    const threadId = await createTestThread();
    const lastActivityAt = await readLastActivityAt(threadId);

    const unread = await runThreadMutation(
      'markAgentChatThreadAsUnread',
      threadId,
    );

    expect(unread.body.data.markAgentChatThreadAsUnread.lastReadAt).toBeNull();

    const read = await runThreadMutation('markAgentChatThreadAsRead', threadId);

    expect(
      new Date(read.body.data.markAgentChatThreadAsRead.lastReadAt).getTime(),
    ).toBe(lastActivityAt.getTime());

    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "lastActivityAt" = $2 WHERE id = $1`,
      [threadId, new Date(lastActivityAt.getTime() - 60_000)],
    );

    const readAgain = await runThreadMutation(
      'markAgentChatThreadAsRead',
      threadId,
    );

    expect(
      new Date(
        readAgain.body.data.markAgentChatThreadAsRead.lastReadAt,
      ).getTime(),
    ).toBe(lastActivityAt.getTime());
  });

  it('snoozes only into the future and moves the thread back to the inbox', async () => {
    const threadId = await createTestThread();
    const pastSnooze = await makeMetadataApiRequest({
      query: SNOOZE,
      variables: {
        threadId,
        snoozedUntil: new Date(Date.now() - 60_000).toISOString(),
      },
    });

    expect(pastSnooze.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');

    const snoozedUntil = new Date(Date.now() + 86_400_000).toISOString();
    const snoozed = await makeMetadataApiRequest({
      query: SNOOZE,
      variables: { threadId, snoozedUntil },
    });

    expect(snoozed.body.errors).toBeUndefined();
    expect(snoozed.body.data.snoozeAgentChatThread.archivedAt).not.toBeNull();
    expect(
      new Date(snoozed.body.data.snoozeAgentChatThread.snoozedUntil).getTime(),
    ).toBe(new Date(snoozedUntil).getTime());

    const moved = await runThreadMutation(
      'moveAgentChatThreadToInbox',
      threadId,
    );

    expect(moved.body.data.moveAgentChatThreadToInbox).toMatchObject({
      archivedAt: null,
      snoozedUntil: null,
    });
  });

  it('brings the thread back and marks it read for the member who writes in it', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);
    await runThreadMutation(
      'archiveAgentChatThread',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    await runThreadMutation('archiveAgentChatThread', threadId);
    await runThreadMutation('markAgentChatThreadAsUnread', threadId);

    const { lastActivityAt } =
      await getAppProviderByClassName<AgentChatThreadParticipantService>(
        'AgentChatThreadParticipantService',
      ).recordMemberActivity({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        threadId,
        text: 'Can you check the Stripe renewal?',
      });

    const owner = await findMyParticipant(threadId);

    expect(lastActivityAt).not.toBeNull();
    expect(await readThreadActivity(threadId)).toMatchObject({
      lastMessageText: 'Can you check the Stripe renewal?',
      lastMessageSenderWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      writerWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
    });
    expect(owner).toMatchObject({ archivedAt: null, snoozedUntil: null });
    expect(new Date(owner!.lastReadAt!).getTime()).toBe(
      lastActivityAt!.getTime(),
    );

    // The other member archived before this activity, so it is back in their
    // inbox and unread, without anyone touching their row
    const member = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(new Date(member!.archivedAt!).getTime()).toBeLessThan(
      lastActivityAt!.getTime(),
    );
    expect(member!.lastReadAt).toBeNull();
  });

  it('brings a thread back for its members on activity no member wrote', async () => {
    const threadId = await createTestThread();
    const archived = await runThreadMutation(
      'archiveAgentChatThread',
      threadId,
    );

    expect(archived.body.errors).toBeUndefined();
    expect(archived.body.data.archiveAgentChatThread.archivedAt).not.toBeNull();

    await getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    ).recordThreadActivity({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      threadId,
      text: 'The renewal is due next week.',
    });

    const owner = await findMyParticipant(threadId);
    const { lastActivityAt, ...lastMessage } =
      await readThreadActivity(threadId);

    expect(lastMessage).toMatchObject({
      lastMessageText: 'The renewal is due next week.',
      lastMessageSenderWorkspaceMemberId: null,
    });

    expect(new Date(owner!.archivedAt!).getTime()).toBeLessThan(
      lastActivityAt.getTime(),
    );
    expect(new Date(owner!.lastReadAt!).getTime()).toBeLessThan(
      lastActivityAt.getTime(),
    );
  });

  it("only lists the caller's own rows", async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);
    await runThreadMutation(
      'archiveAgentChatThread',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    const response = await makeMetadataApiRequest(
      { query: MY_PARTICIPANTS, variables: { threadIds: [threadId] } },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const rows: { workspaceMemberId: string }[] =
      await global.testDataSource.query(
        `SELECT "workspaceMemberId" FROM ${SCHEMA}."agentChatThreadParticipant" WHERE "threadId" = $1`,
        [threadId],
      );

    expect(rows).toHaveLength(2);
    expect(
      (
        response.body.data.myAgentChatThreadParticipants as Participant[]
      ).filter((participant) => participant.threadId === threadId),
    ).toHaveLength(1);
  });

  it('stops listing a thread once the member loses access to it', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);
    await runThreadMutation(
      'archiveAgentChatThread',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeDefined();

    await setShareWithJony(threadId, false);

    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeUndefined();
  });
});
