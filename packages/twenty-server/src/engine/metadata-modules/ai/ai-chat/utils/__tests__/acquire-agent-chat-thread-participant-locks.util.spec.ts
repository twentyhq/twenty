import { acquireAgentChatThreadParticipantLocks } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-thread-participant-locks.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const FIRST_THREAD_ID = '20202020-0000-4000-8000-00000000000a';
const SECOND_THREAD_ID = '20202020-0000-4000-8000-00000000000b';
const FIRST_MEMBER_ID = '20202020-0000-4000-8000-00000000000c';
const SECOND_MEMBER_ID = '20202020-0000-4000-8000-00000000000d';

it('locks distinct participants in a single ordered batch across threads and members', async () => {
  const executeQuery = jest.fn().mockResolvedValue([]);

  await acquireAgentChatThreadParticipantLocks({
    executeQuery,
    participants: [
      {
        workspaceId: WORKSPACE_ID,
        threadId: SECOND_THREAD_ID,
        workspaceMemberId: FIRST_MEMBER_ID,
      },
      {
        workspaceId: WORKSPACE_ID,
        threadId: FIRST_THREAD_ID,
        workspaceMemberId: SECOND_MEMBER_ID,
      },
      {
        workspaceId: WORKSPACE_ID,
        threadId: FIRST_THREAD_ID,
        workspaceMemberId: FIRST_MEMBER_ID,
      },
      {
        workspaceId: WORKSPACE_ID,
        threadId: FIRST_THREAD_ID,
        workspaceMemberId: SECOND_MEMBER_ID,
      },
    ],
  });

  expect(executeQuery).toHaveBeenCalledTimes(1);
  expect(executeQuery).toHaveBeenCalledWith({
    query: expect.stringContaining('ORDER BY lock_key'),
    parameters: [
      [
        `agent-chat-thread-participant:${WORKSPACE_ID}:${FIRST_THREAD_ID}:${FIRST_MEMBER_ID}`,
        `agent-chat-thread-participant:${WORKSPACE_ID}:${FIRST_THREAD_ID}:${SECOND_MEMBER_ID}`,
        `agent-chat-thread-participant:${WORKSPACE_ID}:${SECOND_THREAD_ID}:${FIRST_MEMBER_ID}`,
      ],
    ],
  });
});

it('skips lock acquisition when there are no participants', async () => {
  const executeQuery = jest.fn().mockResolvedValue([]);

  await acquireAgentChatThreadParticipantLocks({
    executeQuery,
    participants: [],
  });

  expect(executeQuery).not.toHaveBeenCalled();
});
