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

import { type AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const PARTICIPANT_FIELDS =
  'id threadId lastReadAt archivedAt snoozedUntil updatedAt';

const MY_PARTICIPANTS = parse(
  `query MyParticipants { myAgentChatThreadParticipants { ${PARTICIPANT_FIELDS} } }`,
);

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

type Participant = {
  id: string;
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
    { query: MY_PARTICIPANTS },
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
    jest.restoreAllMocks();

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

  it('reads a snooze whose time passed as ended before its end has run', async () => {
    const threadId = await createTestThread();

    await makeMetadataApiRequest({
      query: SNOOZE,
      variables: {
        threadId,
        snoozedUntil: buildFutureSnoozedUntil(),
      },
    });

    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."agentChatThreadParticipant" SET "snoozedUntil" = $3
       WHERE "threadId" = $1 AND "workspaceMemberId" = $2`,
      [
        threadId,
        WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        new Date(Date.now() - 1000),
      ],
    );

    expect(await findMyParticipant(threadId)).toMatchObject({
      archivedAt: null,
      snoozedUntil: expect.any(String),
    });
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
      { query: MY_PARTICIPANTS },
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
