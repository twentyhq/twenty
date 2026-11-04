import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { randomUUID } from 'node:crypto';
import { parse } from 'graphql';
import {
  type ObjectRecordCreateEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FeatureFlagKey,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { removeAgentChatSnoozeEndJobs } from 'test/integration/utils/remove-agent-chat-snooze-end-jobs.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setManualRecordShare } from 'test/integration/utils/set-manual-record-share.util';
import { AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-delivery-reason.enum';
import { type AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

export const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

export const buildJonyThreadAccess = (threadId: string) => ({
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
  threadId,
});

const PARTICIPANT_FIELDS =
  'id threadId lastReadAt archivedAt snoozedUntil isSubscribed lastMentionedAt mentionsResolvedAt updatedAt';

const UPDATE_INBOX_STATE = parse(
  `mutation UpdateInboxState($threadIds: [UUID!]!, $action: AgentChatInboxAction!, $snoozedUntil: DateTime) { updateAgentChatThreadInboxState(threadIds: $threadIds, action: $action, snoozedUntil: $snoozedUntil) { ${PARTICIPANT_FIELDS} } }`,
);

// Outlasts any test, yet within the delay the test queue fast-forwards
export const buildFutureSnoozedUntil = () =>
  new Date(Date.now() + 30_000).toISOString();

const ASSIGN = parse(
  `mutation Assign($threadId: UUID!, $assigneeWorkspaceMemberId: UUID) { assignAgentChatThread(threadId: $threadId, assigneeWorkspaceMemberId: $assigneeWorkspaceMemberId) }`,
);

export const assign = (
  threadId: string,
  assigneeWorkspaceMemberId: string | null,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeMetadataApiRequest(
    { query: ASSIGN, variables: { threadId, assigneeWorkspaceMemberId } },
    token,
  );

export const readAssigneeId = async (
  threadId: string,
): Promise<string | null> => {
  const [{ assigneeId }]: { assigneeId: string | null }[] =
    await global.testDataSource.query(
      `SELECT "assigneeId" FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
      [threadId],
    );

  return assigneeId;
};

export const addParticipants = ({
  threadId,
  workspaceMemberIds,
  workspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
}: {
  threadId: string;
  workspaceMemberIds: string[];
  workspaceMemberId?: string;
}) =>
  getAppProviderByClassName<AgentChatInboxDeliveryService>(
    'AgentChatInboxDeliveryService',
  ).deliverThreadToMemberInboxes({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    workspaceMemberId,
    threadId,
    workspaceMemberIds,
    reason: AgentChatInboxDeliveryReason.MENTION,
  });

type Participant = {
  id: string;
  threadId: string;
  lastReadAt: string | null;
  archivedAt: string | null;
  snoozedUntil: string | null;
  isSubscribed: boolean;
  lastMentionedAt: string | null;
  mentionsResolvedAt: string | null;
};

const OPEN_THREADS_SUMMARY = parse(
  `query OpenThreadsSummary { agentChatOpenThreadsSummary { openThreadCount unreadOpenThreadCount needsInputThreadCount hasUnreadOpenThread hasUnreadMentionThread hasUnreadAssignedThread } }`,
);

type OpenThreadsSummary = {
  openThreadCount: number;
  unreadOpenThreadCount: number;
  needsInputThreadCount: number;
  hasUnreadOpenThread: boolean;
  hasUnreadMentionThread: boolean;
  hasUnreadAssignedThread: boolean;
};

export const findOpenThreadsSummary = async (
  token: string = APPLE_JONY_MEMBER_ACCESS_TOKEN,
): Promise<OpenThreadsSummary> => {
  const response = await makeMetadataApiRequest(
    { query: OPEN_THREADS_SUMMARY },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.agentChatOpenThreadsSummary;
};

export const runInboxAction = (
  action: string,
  threadIds: string | string[],
  {
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
    snoozedUntil,
  }: { token?: string; snoozedUntil?: string } = {},
) =>
  makeMetadataApiRequest(
    {
      query: UPDATE_INBOX_STATE,
      variables: { threadIds: [threadIds].flat(), action, snoozedUntil },
    },
    token,
  );

// Read the way the inbox does: rows come with the threads the caller can read
export const findThreadParticipants = async (
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

export const findMyParticipant = async (
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

export const readThreadActivity = async (threadId: string) => {
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

export const readLastActivityAt = async (threadId: string): Promise<Date> =>
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

export const spyOnParticipantEvents = () =>
  jest.spyOn(
    getAppProviderByClassName<WorkspaceEventEmitter>('WorkspaceEventEmitter'),
    'emitDatabaseBatchEvent',
  );

export const findParticipantEvents = (
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

export const listParticipantRecordIds = async (
  token: string,
): Promise<string[]> => {
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

export const setShareWithMember = async ({
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

export const setShareWithJony = (threadId: string, enabled: boolean) =>
  setShareWithMember({
    threadId,
    workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    accessLevel: RecordShareAccessLevel.READ,
    enabled,
  });

const setRecordSharingEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
    value,
    expectToFail: false,
  });

export const setUpChatThreadParticipantTests = () => {
  beforeAll(() => setRecordSharingEnabled(true));

  afterAll(() => setRecordSharingEnabled(false));

  const createdThreadIds: string[] = [];

  const createTestThread = async () => {
    const threadId = await createThread();

    createdThreadIds.push(threadId);

    return threadId;
  };

  afterEach(async () => {
    jest.restoreAllMocks();
    await removeAgentChatSnoozeEndJobs({ threadIds: createdThreadIds });

    for (const manualShare of enabledManualShares.splice(0)) {
      await setShareWithMember({ ...manualShare, enabled: false });
    }
    // Mentions share chats with Jony from the code under test
    for (const threadId of createdThreadIds.splice(0)) {
      await setShareWithJony(threadId, false);
      await destroyAgentChatThread({ threadId });
    }
  });

  return { createTestThread };
};
