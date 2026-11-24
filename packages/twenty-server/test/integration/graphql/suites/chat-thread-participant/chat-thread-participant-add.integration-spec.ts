import { randomUUID } from 'node:crypto';
import { AGENT_CHAT_THREAD_PARTICIPANTS_ADD_MAX_COUNT } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participants-add-max-count.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import {
  setUpChatThreadParticipantTests,
  addParticipantsThroughApi,
  findMyParticipant,
  readThreadActivity,
  setShareWithJony,
} from 'test/integration/graphql/suites/chat-thread-participant/utils/chat-thread-participant-test.util';

describe('Adding chat thread participants through the authenticated API', () => {
  const { createTestThread } = setUpChatThreadParticipantTests();

  it('adds a member to the chat and brings it to their inbox unread', async () => {
    const threadId = await createTestThread();

    const response = await addParticipantsThroughApi({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.addAgentChatThreadParticipants).toEqual([
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    ]);
    expect(
      await findMyParticipant(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toMatchObject({ lastReadAt: null, archivedAt: null });
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds,
    ).toEqual([WORKSPACE_MEMBER_DATA_SEED_IDS.JONY]);
  });

  it('refuses a caller who can only read the chat', async () => {
    const threadId = await createTestThread();

    await setShareWithJony(threadId, true);

    const response = await addParticipantsThroughApi({
      threadId,
      workspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM],
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds ?? [],
    ).toEqual([]);
  });

  it('refuses more members than one add allows', async () => {
    const threadId = await createTestThread();

    const response = await addParticipantsThroughApi({
      threadId,
      workspaceMemberIds: [
        WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        ...Array.from(
          { length: AGENT_CHAT_THREAD_PARTICIPANTS_ADD_MAX_COUNT },
          () => randomUUID(),
        ),
      ],
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(
      (await readThreadActivity(threadId)).writerWorkspaceMemberIds ?? [],
    ).toEqual([]);
  });
});
