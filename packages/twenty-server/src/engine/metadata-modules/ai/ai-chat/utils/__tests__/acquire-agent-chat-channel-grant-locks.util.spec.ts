import { acquireAgentChatChannelGrantLocks } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const FIRST_CHANNEL_ID = '20202020-0000-4000-8000-00000000000a';
const SECOND_CHANNEL_ID = '20202020-0000-4000-8000-00000000000b';

const SHARED_LOCK_QUERY =
  'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))';
const EXCLUSIVE_LOCK_QUERY =
  'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))';

describe('acquireAgentChatChannelGrantLocks', () => {
  it('locks each channel once, in ascending order', async () => {
    const query = jest.fn().mockResolvedValue([]);

    await acquireAgentChatChannelGrantLocks({
      manager: { query },
      workspaceId: WORKSPACE_ID,
      channelIds: [
        SECOND_CHANNEL_ID,
        null,
        FIRST_CHANNEL_ID,
        undefined,
        SECOND_CHANNEL_ID,
      ],
      mode: 'shared',
    });

    expect(query.mock.calls).toEqual([
      [
        SHARED_LOCK_QUERY,
        [`agent-chat-channel-grants:${WORKSPACE_ID}:${FIRST_CHANNEL_ID}`],
      ],
      [
        SHARED_LOCK_QUERY,
        [`agent-chat-channel-grants:${WORKSPACE_ID}:${SECOND_CHANNEL_ID}`],
      ],
    ]);
  });

  it('takes the lock exclusively for a channel-wide rewrite', async () => {
    const query = jest.fn().mockResolvedValue([]);

    await acquireAgentChatChannelGrantLocks({
      manager: { query },
      workspaceId: WORKSPACE_ID,
      channelIds: [FIRST_CHANNEL_ID],
      mode: 'exclusive',
    });

    expect(query.mock.calls).toEqual([
      [
        EXCLUSIVE_LOCK_QUERY,
        [`agent-chat-channel-grants:${WORKSPACE_ID}:${FIRST_CHANNEL_ID}`],
      ],
    ]);
  });

  it('locks nothing for a chat outside any channel', async () => {
    const query = jest.fn().mockResolvedValue([]);

    await acquireAgentChatChannelGrantLocks({
      manager: { query },
      workspaceId: WORKSPACE_ID,
      channelIds: [null, undefined],
      mode: 'shared',
    });

    expect(query).not.toHaveBeenCalled();
  });
});
