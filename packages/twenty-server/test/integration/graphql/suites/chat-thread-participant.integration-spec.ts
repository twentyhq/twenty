import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import {
  type ObjectRecordCreateEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setManualRecordShare } from 'test/integration/utils/set-manual-record-share.util';

import { type AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const PARTICIPANT_FIELDS =
  'id threadId lastReadAt archivedAt snoozedUntil isSubscribed lastMentionedAt updatedAt';

const buildThreadMutation = (name: string) =>
  parse(
    `mutation Run($threadId: UUID!) { ${name}(threadId: $threadId) { ${PARTICIPANT_FIELDS} } }`,
  );

const SNOOZE = parse(
  `mutation Snooze($threadId: UUID!, $snoozedUntil: DateTime!) { snoozeAgentChatThread(threadId: $threadId, snoozedUntil: $snoozedUntil) { ${PARTICIPANT_FIELDS} } }`,
);

// Outlasts any test, yet within the delay the test queue fast-forwards
const buildFutureSnoozedUntil = () =>
  new Date(Date.now() + 30_000).toISOString();

const ASSIGN = parse(
  `mutation Assign($threadId: UUID!, $assigneeWorkspaceMemberId: UUID) { assignAgentChatThread(threadId: $threadId, assigneeWorkspaceMemberId: $assigneeWorkspaceMemberId) }`,
);

const assign = (
  threadId: string,
  assigneeWorkspaceMemberId: string | null,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeMetadataApiRequest(
    { query: ASSIGN, variables: { threadId, assigneeWorkspaceMemberId } },
    token,
  );

const readAssigneeId = async (threadId: string): Promise<string | null> => {
  const [{ assigneeId }]: { assigneeId: string | null }[] =
    await global.testDataSource.query(
      `SELECT "assigneeId" FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
      [threadId],
    );

  return assigneeId;
};

const ADD_PARTICIPANTS = parse(
  `mutation AddParticipants($threadId: UUID!, $workspaceMemberIds: [UUID!]!) { addAgentChatThreadParticipants(threadId: $threadId, workspaceMemberIds: $workspaceMemberIds) }`,
);

const addParticipants = (
  threadId: string,
  workspaceMemberIds: string[],
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeMetadataApiRequest(
    { query: ADD_PARTICIPANTS, variables: { threadId, workspaceMemberIds } },
    token,
  );

type Participant = {
  id: string;
  threadId: string;
  lastReadAt: string | null;
  archivedAt: string | null;
  snoozedUntil: string | null;
  isSubscribed: boolean;
  lastMentionedAt: string | null;
};

const OPEN_THREADS_SUMMARY = parse(
  `query OpenThreadsSummary { agentChatOpenThreadsSummary { openThreadCount needsInputThreadCount hasUnreadOpenThread hasUnreadMentionThread hasUnreadAssignedThread } }`,
);

type OpenThreadsSummary = {
  openThreadCount: number;
  needsInputThreadCount: number;
  hasUnreadOpenThread: boolean;
  hasUnreadMentionThread: boolean;
  hasUnreadAssignedThread: boolean;
};

const findOpenThreadsSummary = async (
  token: string = APPLE_JONY_MEMBER_ACCESS_TOKEN,
): Promise<OpenThreadsSummary> => {
  const response = await makeMetadataApiRequest(
    { query: OPEN_THREADS_SUMMARY },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.agentChatOpenThreadsSummary;
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

// Read the way the inbox does: rows come with the threads the caller can read
const findThreadParticipants = async (
  threadId: string,
  token: string,
): Promise<(Participant & { workspaceMemberId: string })[] | undefined> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'agentChatThread',
      objectMetadataPluralName: 'agentChatThreads',
      gqlFields: `id participants { edges { node { ${PARTICIPANT_FIELDS} workspaceMemberId } } }`,
      filter: { id: { eq: threadId } },
    }),
    token,
  );

  expect(response.body.errors).toBeUndefined();

  const [thread] = response.body.data.agentChatThreads.edges;

  return thread?.node.participants.edges.map(
    ({ node }: { node: Participant & { workspaceMemberId: string } }) => node,
  );
};

const findMyParticipant = async (
  threadId: string,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
): Promise<Participant | undefined> => {
  const workspaceMemberId =
    token === APPLE_JONY_MEMBER_ACCESS_TOKEN
      ? WORKSPACE_MEMBER_DATA_SEED_IDS.JONY
      : WORKSPACE_MEMBER_DATA_SEED_IDS.JANE;

  return (await findThreadParticipants(threadId, token))?.find(
    (participant) => participant.workspaceMemberId === workspaceMemberId,
  );
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

const spyOnParticipantEvents = () =>
  jest.spyOn(
    getAppProviderByClassName<WorkspaceEventEmitter>('WorkspaceEventEmitter'),
    'emitDatabaseBatchEvent',
  );

const findParticipantEvents = (
  eventSpy: ReturnType<typeof spyOnParticipantEvents>,
  threadId: string,
) =>
  eventSpy.mock.calls
    .map(([batchEvent]) => batchEvent)
    .filter(
      (batchEvent) =>
        batchEvent?.objectMetadataNameSingular === 'agentChatThreadParticipant',
    )
    .flatMap((batchEvent) =>
      (
        batchEvent!.events as (
          | ObjectRecordCreateEvent<Participant>
          | ObjectRecordUpdateEvent<Participant>
        )[]
      )
        .filter(({ properties }) => properties.after.threadId === threadId)
        .map(({ properties }) => ({
          action: batchEvent!.action,
          updatedFields:
            'updatedFields' in properties ? properties.updatedFields : [],
        })),
    );

const listParticipantRecordIds = async (token: string): Promise<string[]> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'agentChatThreadParticipant',
      objectMetadataPluralName: 'agentChatThreadParticipants',
      gqlFields: 'id',
      first: 200,
    }),
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.agentChatThreadParticipants.edges.map(
    ({ node }: { node: { id: string } }) => node.id,
  );
};

type ManualShare = {
  threadId: string;
  workspaceMemberId: string;
  accessLevel: RecordShareAccessLevel;
};

// Destroying a chat keeps its grants, so every grant a test enables is
// disabled again after it
const enabledManualShares: ManualShare[] = [];

const setShareWithMember = async ({
  threadId,
  workspaceMemberId,
  accessLevel,
  enabled,
}: {
  threadId: string;
  workspaceMemberId: string;
  accessLevel: RecordShareAccessLevel;
  enabled: boolean;
}) => {
  if (enabled) {
    enabledManualShares.push({ threadId, workspaceMemberId, accessLevel });
  }

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
      principalId: workspaceMemberId,
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      accessLevel,
      sourceId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    },
    enabled,
  });
};

const setShareWithJony = (threadId: string, enabled: boolean) =>
  setShareWithMember({
    threadId,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    accessLevel: RecordShareAccessLevel.READ,
    enabled,
  });

describe('Chat thread participant state through the authenticated API', () => {
  const createdThreadIds: string[] = [];

  const createTestThread = async () => {
    const threadId = await createThread();

    createdThreadIds.push(threadId);

    return threadId;
  };

  afterEach(async () => {
    jest.restoreAllMocks();

    for (const manualShare of enabledManualShares.splice(0)) {
      await setShareWithMember({ ...manualShare, enabled: false });
    }
    // Mentions share chats with Jony from the code under test
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

    const snoozedUntil = buildFutureSnoozedUntil();
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

  it('sends each change as a record event carrying what changed', async () => {
    const eventSpy = spyOnParticipantEvents();
    const threadId = await createTestThread();

    await runThreadMutation('markAgentChatThreadAsUnread', threadId);
    await runThreadMutation('markAgentChatThreadAsUnread', threadId);
    await runThreadMutation('archiveAgentChatThread', threadId);

    expect(findParticipantEvents(eventSpy, threadId)).toEqual([
      { action: 'created', updatedFields: [] },
      { action: 'updated', updatedFields: ['lastReadAt', 'updatedAt'] },
      { action: 'updated', updatedFields: ['updatedAt'] },
      { action: 'updated', updatedFields: ['archivedAt', 'updatedAt'] },
    ]);
  });

  it('lets only its member read a row, through the grant it is given', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);
    await runThreadMutation(
      'archiveAgentChatThread',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

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

    await makeMetadataApiRequest({
      query: SNOOZE,
      variables: {
        threadId,
        snoozedUntil: buildFutureSnoozedUntil(),
      },
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
    const participant =
      await getAppProviderByClassName<AgentChatThreadParticipantService>(
        'AgentChatThreadParticipantService',
      )['setArchive'](
        {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          threadId,
        },
        snoozedUntil,
      );

    expect(participant.archivedAt).toBeNull();
    expect(new Date(participant.snoozedUntil!).getTime()).toBe(
      snoozedUntil.getTime(),
    );
  });

  it('waits for the database clock before ending a snooze', async () => {
    const threadId = await createTestThread();
    const snoozedUntil = buildFutureSnoozedUntil();

    await makeMetadataApiRequest({
      query: SNOOZE,
      variables: { threadId, snoozedUntil },
    });

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

    await makeMetadataApiRequest({
      query: SNOOZE,
      variables: {
        threadId,
        snoozedUntil: buildFutureSnoozedUntil(),
      },
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
      new Date(lastActivityAt!).getTime(),
    );

    // The other member archived before this activity, so it is back in their
    // inbox and unread, without anyone touching their row
    const member = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(new Date(member!.archivedAt!).getTime()).toBeLessThan(
      new Date(lastActivityAt!).getTime(),
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

    const rows: { workspaceMemberId: string }[] =
      await global.testDataSource.query(
        `SELECT "workspaceMemberId" FROM ${SCHEMA}."agentChatThreadParticipant" WHERE "threadId" = $1`,
        [threadId],
      );

    expect(rows).toHaveLength(2);
    expect(
      await findThreadParticipants(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toEqual([
      expect.objectContaining({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    ]);
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

  it('shares the thread with a mentioned member and brings it to their inbox unread', async () => {
    const threadId = await createTestThread();

    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeUndefined();

    const response = await addParticipants(threadId, [
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    ]);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.addAgentChatThreadParticipants).toEqual([
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    ]);
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({ lastReadAt: null, archivedAt: null, snoozedUntil: null });
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds,
    ).toEqual([WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);

    // Editors can mention others too; the owner keeps following as owner
    const addedByJony = await addParticipants(
      threadId,
      [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(addedByJony.body.errors).toBeUndefined();
    expect(addedByJony.body.data.addAgentChatThreadParticipants).toEqual([
      WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    ]);
    expect(await findMyParticipant(threadId)).toMatchObject({
      lastReadAt: null,
    });
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds,
    ).toEqual([WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);
  });

  it('brings the thread back unread for a participant who had read and archived it', async () => {
    const threadId = await createTestThread();

    await addParticipants(threadId, [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);
    await runThreadMutation(
      'markAgentChatThreadAsRead',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    await runThreadMutation(
      'archiveAgentChatThread',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    await addParticipants(threadId, [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);

    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({ lastReadAt: null, archivedAt: null, snoozedUntil: null });
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds,
    ).toEqual([WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);
  });

  it('refuses a member who can only read the thread', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);

    const response = await addParticipants(
      threadId,
      [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM],
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds ?? [],
    ).toEqual([]);
  });

  it('leaves out a member who could only read the thread when the sender cannot share it', async () => {
    const threadId = await createTestThread();

    await setShareWithMember({
      threadId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
      enabled: true,
    });
    await setShareWithMember({
      threadId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      accessLevel: RecordShareAccessLevel.READ,
      enabled: true,
    });

    const response = await addParticipants(
      threadId,
      [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM],
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.addAgentChatThreadParticipants).toEqual([]);
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds ?? [],
    ).toEqual([]);
  });

  it('keeps an unsubscribed chat done through new activity', async () => {
    const threadId = await createTestThread();
    const unsubscribed = await runThreadMutation(
      'unsubscribeFromAgentChatThread',
      threadId,
    );

    expect(unsubscribed.body.errors).toBeUndefined();
    expect(unsubscribed.body.data.unsubscribeFromAgentChatThread).toMatchObject(
      { isSubscribed: false, snoozedUntil: null },
    );
    expect(
      unsubscribed.body.data.unsubscribeFromAgentChatThread.archivedAt,
    ).not.toBeNull();

    await getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    ).recordThreadActivity({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      threadId,
      text: 'The renewal went through',
    });

    expect(await findMyParticipant(threadId)).toMatchObject({
      isSubscribed: false,
    });

    // Subscribing again leaves the chat where it is until something happens
    const subscribed = await runThreadMutation(
      'subscribeToAgentChatThread',
      threadId,
    );

    expect(subscribed.body.errors).toBeUndefined();
    expect(subscribed.body.data.subscribeToAgentChatThread).toMatchObject({
      isSubscribed: true,
      archivedAt:
        unsubscribed.body.data.unsubscribeFromAgentChatThread.archivedAt,
    });
  });

  it('follows the chat again for a member who reopens, snoozes or writes in it', async () => {
    const threadId = await createTestThread();

    await runThreadMutation('unsubscribeFromAgentChatThread', threadId);
    await runThreadMutation('moveAgentChatThreadToInbox', threadId);

    expect(await findMyParticipant(threadId)).toMatchObject({
      isSubscribed: true,
      archivedAt: null,
    });

    await runThreadMutation('unsubscribeFromAgentChatThread', threadId);
    await makeMetadataApiRequest(
      {
        query: SNOOZE,
        variables: { threadId, snoozedUntil: buildFutureSnoozedUntil() },
      },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(await findMyParticipant(threadId)).toMatchObject({
      isSubscribed: true,
    });

    await runThreadMutation('unsubscribeFromAgentChatThread', threadId);
    await getAppProviderByClassName<AgentChatThreadParticipantService>(
      'AgentChatThreadParticipantService',
    ).recordMemberActivity({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      threadId,
      text: 'Back on this one',
    });

    expect(await findMyParticipant(threadId)).toMatchObject({
      isSubscribed: true,
      archivedAt: null,
    });
  });

  it('follows the chat again and records the mention for a mentioned member who had unsubscribed', async () => {
    const threadId = await createTestThread();

    await addParticipants(threadId, [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);

    const firstMention = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(firstMention).toMatchObject({ isSubscribed: true });
    expect(firstMention!.lastMentionedAt).not.toBeNull();

    await runThreadMutation(
      'unsubscribeFromAgentChatThread',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    await addParticipants(threadId, [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);

    const secondMention = await findMyParticipant(
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(secondMention).toMatchObject({
      isSubscribed: true,
      archivedAt: null,
      lastReadAt: null,
    });
    expect(new Date(secondMention!.lastMentionedAt!).getTime()).toBeGreaterThan(
      new Date(firstMention!.lastMentionedAt!).getTime(),
    );
  });

  it('refuses to change the subscription of a member who cannot read the chat', async () => {
    const threadId = await createTestThread();
    const response = await runThreadMutation(
      'unsubscribeFromAgentChatThread',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('assigns a chat to a member who could not read it, who then finds it unread in their inbox', async () => {
    const threadId = await createTestThread();
    const response = await assign(
      threadId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );

    expect(response.body.errors).toBeUndefined();
    expect(await readAssigneeId(threadId)).toBe(
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    );
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({
      isSubscribed: true,
      archivedAt: null,
      lastReadAt: null,
    });
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds,
    ).toEqual([WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);
  });

  it('keeps a chat read for a member who assigns it to themselves', async () => {
    const threadId = await createTestThread();

    await runThreadMutation('archiveAgentChatThread', threadId);

    const response = await assign(
      threadId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    );

    expect(response.body.errors).toBeUndefined();

    const participant = await findMyParticipant(threadId);

    expect(participant).toMatchObject({ archivedAt: null, isSubscribed: true });
    expect(participant!.lastReadAt).not.toBeNull();
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds ?? [],
    ).toEqual([]);
  });

  it('keeps the former assignee following the chat once it is unassigned', async () => {
    const threadId = await createTestThread();

    await assign(threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JONY);

    const response = await assign(threadId, null);

    expect(response.body.errors).toBeUndefined();
    expect(await readAssigneeId(threadId)).toBeNull();
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({ isSubscribed: true });
  });

  it('refuses to unsubscribe the assignee', async () => {
    const threadId = await createTestThread();

    await assign(threadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JONY);

    const response = await runThreadMutation(
      'unsubscribeFromAgentChatThread',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors[0].extensions.code).toBe('CONFLICT');
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({ isSubscribed: true });
  });

  it('refuses to assign a chat for a member who can only read it', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);

    const response = await assign(
      threadId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(await readAssigneeId(threadId)).toBeNull();
  });

  it('refuses an assignee who cannot reply when the caller cannot share the chat', async () => {
    const threadId = await createTestThread();

    await setShareWithMember({
      threadId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
      enabled: true,
    });

    const response = await assign(
      threadId,
      WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(await readAssigneeId(threadId)).toBeNull();
  });

  // Other tests' chats may stay open for the member, so counts are compared
  // with what they were before
  it('summarizes the open chats the member can read, from their own rows', async () => {
    const before = await findOpenThreadsSummary();
    const threadId = await createTestThread();

    expect(await findOpenThreadsSummary()).toEqual(before);

    await setShareWithJony(threadId, true);
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "pendingQuestionMessageId" = $2 WHERE id = $1`,
      [threadId, randomUUID()],
    );

    expect(await findOpenThreadsSummary()).toMatchObject({
      openThreadCount: before.openThreadCount + 1,
      needsInputThreadCount: before.needsInputThreadCount + 1,
      hasUnreadOpenThread: true,
    });

    await runThreadMutation(
      'markAgentChatThreadAsRead',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(await findOpenThreadsSummary()).toMatchObject({
      openThreadCount: before.openThreadCount + 1,
      hasUnreadOpenThread: before.hasUnreadOpenThread,
    });

    await runThreadMutation(
      'archiveAgentChatThread',
      threadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(await findOpenThreadsSummary()).toEqual(before);
  });

  it('flags the open chats the member was mentioned in or assigned that are unread', async () => {
    const mentionedThreadId = await createTestThread();
    const assignedThreadId = await createTestThread();

    await addParticipants(mentionedThreadId, [
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    ]);
    await assign(assignedThreadId, WORKSPACE_MEMBER_DATA_SEED_IDS.JONY);

    expect(await findOpenThreadsSummary()).toMatchObject({
      hasUnreadMentionThread: true,
      hasUnreadAssignedThread: true,
    });

    const unsubscribed = await runThreadMutation(
      'unsubscribeFromAgentChatThread',
      mentionedThreadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(unsubscribed.body.errors).toBeUndefined();

    await runThreadMutation(
      'archiveAgentChatThread',
      assignedThreadId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    const before = await findOpenThreadsSummary();

    // Activity brings back a chat filed under done, but not one the member left
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThread" SET "lastActivityAt" = clock_timestamp() WHERE id = ANY($1)`,
      [[mentionedThreadId, assignedThreadId]],
    );

    expect((await findOpenThreadsSummary()).openThreadCount).toBe(
      before.openThreadCount + 1,
    );
  });

  it('reads as empty in a workspace the inbox upgrade has not reached', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);
    jest
      .spyOn(
        getAppProviderByClassName<AgentChatSharingService>(
          'AgentChatSharingService',
        ),
        'hasInboxState',
      )
      .mockResolvedValue(false);

    expect(await findOpenThreadsSummary()).toEqual({
      openThreadCount: 0,
      needsInputThreadCount: 0,
      hasUnreadOpenThread: false,
      hasUnreadMentionThread: false,
      hasUnreadAssignedThread: false,
    });
  });
});
