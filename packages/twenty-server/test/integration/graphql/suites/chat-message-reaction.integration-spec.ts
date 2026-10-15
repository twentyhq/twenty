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

import { type AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const REACTION_FIELDS = 'emoji workspaceMemberIds';

const ADD_REACTION = parse(
  `mutation AddReaction($messageId: UUID!, $emoji: String!) { addAgentChatMessageReaction(messageId: $messageId, emoji: $emoji) { ${REACTION_FIELDS} } }`,
);

const REMOVE_REACTION = parse(
  `mutation RemoveReaction($messageId: UUID!, $emoji: String!) { removeAgentChatMessageReaction(messageId: $messageId, emoji: $emoji) { ${REACTION_FIELDS} } }`,
);

const CHAT_MESSAGES = parse(
  `query ChatMessages($threadId: UUID!) { chatMessages(threadId: $threadId) { id reactions { ${REACTION_FIELDS} } } }`,
);

type Reaction = { emoji: string; workspaceMemberIds: string[] };

const react = (
  mutation: typeof ADD_REACTION,
  messageId: string,
  emoji: string,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeMetadataApiRequest(
    { query: mutation, variables: { messageId, emoji } },
    token,
  );

const addReaction = (messageId: string, emoji: string, token?: string) =>
  react(ADD_REACTION, messageId, emoji, token);

const removeReaction = (messageId: string, emoji: string, token?: string) =>
  react(REMOVE_REACTION, messageId, emoji, token);

const findMessageReactions = async (
  threadId: string,
  messageId: string,
): Promise<Reaction[]> => {
  const response = await makeMetadataApiRequest(
    { query: CHAT_MESSAGES, variables: { threadId } },
    APPLE_JANE_ADMIN_ACCESS_TOKEN,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.chatMessages.find(
    ({ id }: { id: string }) => id === messageId,
  ).reactions;
};

const insertMessage = async ({
  threadId,
  role = 'user',
}: {
  threadId: string;
  role?: string;
}): Promise<string> => {
  const messageId = randomUUID();

  await global.testDataSource.query(
    `INSERT INTO ${SCHEMA}."agentMessage" (id, "threadId", role, status, "senderWorkspaceMemberId", "processedAt")
     VALUES ($1, $2, $3, 'sent', $4, now())`,
    [messageId, threadId, role, WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
  );

  return messageId;
};

const readThreadActivity = async (threadId: string) => {
  const [row]: { lastActivityAt: Date; updatedAt: Date }[] =
    await global.testDataSource.query(
      `SELECT "lastActivityAt", "updatedAt" FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
      [threadId],
    );

  return row;
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

describe('Chat message reactions through the authenticated API', () => {
  let threadId: string;
  let messageId: string;
  let isSharedWithJony: boolean;

  beforeEach(async () => {
    threadId = randomUUID();
    isSharedWithJony = false;

    await getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    ).createThread({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      id: threadId,
      title: 'Reactions',
    });
    messageId = await insertMessage({ threadId });
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    if (isSharedWithJony) {
      await setShareWithJony(threadId, false);
    }
    await destroyAgentChatThread({ threadId });
  });

  const spyOnPublishedReactions = () => {
    const publishSpy = jest.spyOn(
      getAppProviderByClassName<AgentChatEventPublisherService>(
        'AgentChatEventPublisherService',
      ),
      'publish',
    );

    return () =>
      publishSpy.mock.calls
        .map(([args]) => args)
        .filter(({ event }) => event.type === 'message-reactions-updated');
  };

  it('adds a reaction once, sends it to the chat viewers and shows it on the message', async () => {
    const findPublishedReactions = spyOnPublishedReactions();
    const activityBefore = await readThreadActivity(threadId);

    const added = await addReaction(messageId, '👍');

    expect(added.body.errors).toBeUndefined();
    expect(added.body.data.addAgentChatMessageReaction).toEqual([
      {
        emoji: '👍',
        workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      },
    ]);
    expect(findPublishedReactions()).toEqual([
      {
        threadId,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        event: {
          type: 'message-reactions-updated',
          messageId,
          reactions: added.body.data.addAgentChatMessageReaction,
          revision: expect.any(Number),
        },
      },
    ]);

    const addedAgain = await addReaction(messageId, '👍');

    expect(addedAgain.body.errors).toBeUndefined();
    expect(addedAgain.body.data.addAgentChatMessageReaction).toEqual(
      added.body.data.addAgentChatMessageReaction,
    );
    expect(findPublishedReactions()).toHaveLength(1);
    expect(await findMessageReactions(threadId, messageId)).toEqual(
      added.body.data.addAgentChatMessageReaction,
    );
    expect(await readThreadActivity(threadId)).toEqual(activityBefore);
  });

  it('removes a reaction, and removing it again changes nothing', async () => {
    const findPublishedReactions = spyOnPublishedReactions();

    await addReaction(messageId, '👍');
    await addReaction(messageId, '🎉');

    const removed = await removeReaction(messageId, '👍');

    expect(removed.body.errors).toBeUndefined();
    expect(removed.body.data.removeAgentChatMessageReaction).toEqual([
      {
        emoji: '🎉',
        workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      },
    ]);
    const revisions = findPublishedReactions().map(({ event }) =>
      event.type === 'message-reactions-updated' ? event.revision : 0,
    );

    expect(revisions).toHaveLength(3);
    expect([...revisions].sort((a, b) => a - b)).toEqual(revisions);
    expect(new Set(revisions).size).toBe(3);

    const removedAgain = await removeReaction(messageId, '👍');

    expect(removedAgain.body.errors).toBeUndefined();
    expect(removedAgain.body.data.removeAgentChatMessageReaction).toEqual(
      removed.body.data.removeAgentChatMessageReaction,
    );
    expect(findPublishedReactions()).toHaveLength(3);
    expect(await findMessageReactions(threadId, messageId)).toEqual(
      removed.body.data.removeAgentChatMessageReaction,
    );
  });

  it('refuses a member who cannot read the thread, then lets them react once it is shared', async () => {
    const refused = await addReaction(
      messageId,
      '👍',
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(refused.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(await findMessageReactions(threadId, messageId)).toEqual([]);

    const refusedRemoval = await removeReaction(
      messageId,
      '👍',
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(refusedRemoval.body.errors[0].extensions.code).toBe('NOT_FOUND');

    isSharedWithJony = true;
    await setShareWithJony(threadId, true);
    await addReaction(messageId, '🎉');

    const added = await addReaction(
      messageId,
      '👍',
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(added.body.errors).toBeUndefined();
    await addReaction(messageId, '👍');

    // Each emoji keeps the place of its first use, each member the order they reacted in
    expect(await findMessageReactions(threadId, messageId)).toEqual([
      {
        emoji: '🎉',
        workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      },
      {
        emoji: '👍',
        workspaceMemberIds: [
          WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        ],
      },
    ]);
  });

  it.each([
    ['an empty emoji', ''],
    ['text', 'nice'],
    ['an emoji with whitespace', '👍 🎉'],
    ['a value over 32 characters', '👍'.repeat(17)],
  ])('refuses %s', async (_label, emoji) => {
    const response = await addReaction(messageId, emoji);

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(await findMessageReactions(threadId, messageId)).toEqual([]);
  });

  it('refuses a message that does not exist or is never shown', async () => {
    const contextMessageId = await insertMessage({ threadId, role: 'system' });

    for (const unknownMessageId of [randomUUID(), contextMessageId]) {
      const response = await addReaction(unknownMessageId, '👍');

      expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    }
  });

  it('shows the reactions of each message on its own', async () => {
    const otherMessageId = await insertMessage({ threadId });

    await addReaction(otherMessageId, '🚀');

    expect(await findMessageReactions(threadId, messageId)).toEqual([]);
    expect(await findMessageReactions(threadId, otherMessageId)).toEqual([
      {
        emoji: '🚀',
        workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JANE],
      },
    ]);
  });
});
